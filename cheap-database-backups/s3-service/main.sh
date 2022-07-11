#!/usr/bin/env bash

set -eEuo pipefail

PORT="${PORT:-8080}"
echo "Listening on ${PORT}..."

ncat -lk -p "${PORT}" -e "./sync_to_s3.sh"
