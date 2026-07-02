#!/bin/sh
set -e

# Monorepo standalone builds nest server.js under client-main/
if [ -f "/app/client-main/server.js" ]; then
  cd /app/client-main
fi

exec node server.js
