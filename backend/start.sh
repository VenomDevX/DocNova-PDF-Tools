#!/bin/sh
set -eu

# Keep worker count low on small/free instances; override with WEB_CONCURRENCY.
# --max-requests recycles workers periodically so memory can't creep upward.
exec gunicorn \
  --workers "${WEB_CONCURRENCY:-2}" \
  --worker-class sync \
  --bind "0.0.0.0:${PORT:-5000}" \
  --access-logfile - \
  --error-logfile - \
  --timeout 120 \
  --max-requests 200 \
  --max-requests-jitter 50 \
  app:app
