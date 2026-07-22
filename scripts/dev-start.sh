#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/tmp/dev-pids"
LOG_DIR="$ROOT_DIR/tmp/dev-logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

require_node() {
  local major
  major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"

  if (( major < 20 )); then
    echo "Node.js 20.11+ is required. Current version: $(node -v 2>/dev/null || echo unavailable)."
    echo "Install or switch to Node 20+, then run npm install and npm run dev:start again."
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

start_service "api" "npm run dev -w @novera/api"
start_service "web" "npm run dev -w @novera/web"

echo
echo "Novera is starting."
echo "API: http://localhost:4000/api/v1/health"
echo "Swagger: http://localhost:4000/api/docs"
echo "Web: http://localhost:5173"
echo
echo "Use npm run dev:status to check processes."
echo "Use npm run dev:stop to stop the app."
