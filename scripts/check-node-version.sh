#!/usr/bin/env bash
set -euo pipefail

major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
version="$(node -v 2>/dev/null || echo unavailable)"

if (( major < 20 )); then
  echo "Node.js 20.11+ is required. Current version: $version."
  exit 1
fi

echo "Node.js version OK: $version"
