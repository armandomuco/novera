#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/tmp/dev-pids"
LOG_DIR="$ROOT_DIR/tmp/dev-logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

require_node() {
  local major minor
  major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
  minor="$(node -p "process.versions.node.split('.')[1]" 2>/dev/null || echo 0)"

  if ! (( (major == 20 && minor >= 19) || (major == 22 && minor >= 12) || major >= 24 )); then
    echo "Node.js 20.19+ or 22.12+ is required. Current version: $(node -v 2>/dev/null || echo unavailable)."
    echo "Install or switch to a supported Node version, then run npm install and npm run dev:start again."
    exit 1
  fi
}

is_running() {
  local pid_file="$1"
  [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null
}

start_service() {
  local name="$1"
  local command="$2"
  local pid_file="$PID_DIR/$name.pid"
  local log_file="$LOG_DIR/$name.log"

  if is_running "$pid_file"; then
    echo "$name is already running with PID $(cat "$pid_file")."
    return
  fi

  echo "Starting $name..."
  nohup bash -c "cd '$ROOT_DIR' && exec $command" >"$log_file" 2>&1 &

  echo "$!" >"$pid_file"
  echo "$name started with PID $(cat "$pid_file"). Logs: $log_file"
}

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  echo "Dependencies are missing. Run npm install first."
  exit 1
fi

require_node

find_available_port() {
  local port="$1"

  while ! node -e 'const net = require("node:net"); const server = net.createServer().once("error", () => process.exit(1)).once("listening", () => server.close(() => process.exit(0))).listen(Number(process.argv[1]), "127.0.0.1");' "$port" >/dev/null 2>&1; do
    port=$((port + 1))
  done

  echo "$port"
}

if [[ "${SKIP_DOCKER:-0}" == "1" ]]; then
  echo "Skipping Docker dependency startup because SKIP_DOCKER=1."
else
  echo "Starting local dependencies..."
  if ! docker compose up -d redis minio; then
    echo
    echo "Docker dependencies failed to start."
    echo "If another local service is already using a required port, stop it or run:"
    echo "  SKIP_DOCKER=1 npm run dev:start"
    echo "To also use Docker MongoDB, run:"
    echo "  docker compose --profile docker-mongo up -d"
    exit 1
  fi
fi

if is_running "$PID_DIR/api.pid" && [[ -f "$PID_DIR/api.port" ]]; then
  API_PORT="$(cat "$PID_DIR/api.port")"
else
  API_PORT="${API_PORT:-$(find_available_port 4000)}"
fi

if is_running "$PID_DIR/web.pid" && [[ -f "$PID_DIR/web.port" ]]; then
  WEB_PORT="$(cat "$PID_DIR/web.port")"
else
  WEB_PORT="${WEB_PORT:-$(find_available_port 5173)}"
fi

printf '%s\n' "$API_PORT" >"$PID_DIR/api.port"
printf '%s\n' "$WEB_PORT" >"$PID_DIR/web.port"

start_service "api" "env PORT=$API_PORT WEB_APP_URL=http://localhost:$WEB_PORT npm run dev -w @novera/api"
start_service "web" "env VITE_API_PROXY_TARGET=http://localhost:$API_PORT npm run dev -w @novera/web -- --port $WEB_PORT"

sleep 1
if ! is_running "$PID_DIR/api.pid" || ! is_running "$PID_DIR/web.pid"; then
  echo
  echo "A Novera process exited during startup. Recent logs:"
  tail -n 20 "$LOG_DIR/api.log" "$LOG_DIR/web.log" 2>/dev/null || true
  exit 1
fi

echo
echo "Novera is starting."
echo "API: http://localhost:$API_PORT/api/v1/health"
echo "Swagger: http://localhost:$API_PORT/api/docs"
echo "Web: http://localhost:$WEB_PORT"
echo
echo "Use npm run dev:status to check processes."
echo "Use npm run dev:stop to stop the app."
