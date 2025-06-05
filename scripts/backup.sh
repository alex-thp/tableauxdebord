#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/backups/db_backup_$TIMESTAMP.sql"

pg_dump -h db -U myuser -d mydatabase -F c -f "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE"