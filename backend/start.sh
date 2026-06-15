#!/bin/sh
set -eu

exec gunicorn \
  --workers 4 \
  --worker-class sync \
  --bind "0.0.0.0:${PORT:-8080}" \
  --timeout 120 \
  app:app
