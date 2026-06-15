#!/bin/sh
set -eu

exec gunicorn \
  --workers 4 \
  --worker-class sync \
  --bind "0.0.0.0:5000" \
  --access-logfile - \
  --error-logfile - \
  --timeout 120 \
  app:app
