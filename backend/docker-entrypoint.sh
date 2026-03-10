#!/bin/bash

#backend/docker-entrypoint.sh

set -e

echo "[emotitron] Running Alembic migrations..."
alembic upgrade head

if [ $? -ne 0 ]; then
    echo "[emotitron] ERROR: Alembic migration failed. Aborting startup."
    exit 1
fi

echo "[emotitron] Migrations complete. Starting Gunicorn..."

exec gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 2 \
    --bind 0.0.0.0:${PORT:-8000} \
    --timeout 120 \
    --keep-alive 5 \
    --log-level info \
    --access-logfile - \
    --error-logfile -


























































