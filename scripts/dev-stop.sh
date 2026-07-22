#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/tmp/dev-pids"

stop_service() {
  local name="$1"
  local pid_file="$PID_DIR/$name.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name is not tracked as running."
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping $name with PID $pid..."
    kill "$pid"
  else
    echo "$name PID $pid is not running."
  fi

  rm -f "$pid_file"
}

stop_service "api"
stop_service "web"

echo
echo "App processes stopped."
echo "Docker dependencies are still running. Use docker compose down to stop MongoDB, Redis, and MinIO."
