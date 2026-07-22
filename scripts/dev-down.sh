#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/dev-stop.sh"

echo
echo "Stopping Docker dependencies..."
(
  cd "$ROOT_DIR"
  docker compose down
)
