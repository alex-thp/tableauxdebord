#!/bin/sh
set -e

echo "Building project..."
npm run build

echo "Starting backend..."
exec node dist/src/main.js