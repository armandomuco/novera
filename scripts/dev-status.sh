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

echo
echo "Useful URLs:"
echo "API health: http://localhost:4000/api/v1/health"
echo "Swagger: http://localhost:4000/api/docs"
echo "Web: http://localhost:5173"
