#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/tmp/dev-pids"

status_service() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name: not started by dev:start"
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if kill -0 "$pid" 2>/dev/null; then
    echo "$name: running with PID $pid"
  else
    echo "$name: stale PID $pid"
  fi
}

status_service "api"
status_service "web"

API_PORT="$(cat "$PID_DIR/api.port" 2>/dev/null || echo 4000)"
WEB_PORT="$(cat "$PID_DIR/web.port" 2>/dev/null || echo 5173)"

echo
echo "Useful URLs:"
echo "API health: http://localhost:$API_PORT/api/v1/health"
echo "Swagger: http://localhost:$API_PORT/api/docs"
echo "Web: http://localhost:$WEB_PORT"
