#!/bin/bash
# MR5 School - Database Backup Script
# This script dumps the MongoDB database to a compressed archive.

# Load environment variables
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -f "$DIR/../.env" ]; then
    export $(grep -v '^#' "$DIR/../.env" | xargs)
fi

# Variables
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$DIR/../backups"
DB_NAME=$(echo $MONGO_URI | sed -e 's/.*\/\([^?]*\).*/\1/')
OUTPUT_FILE="$BACKUP_DIR/mr5_backup_$TIMESTAMP.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting database backup for: $DB_NAME"

# Perform backup using mongodump (requires mongodb-database-tools)
if command -v mongodump &> /dev/null; then
    mongodump --uri="$MONGO_URI" --archive="$OUTPUT_FILE" --gzip
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup successful: $OUTPUT_FILE"
        # Keep only last 7 days of backups
        find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
        echo "🧹 Cleaned up old backups."
    else
        echo "❌ Backup failed."
        exit 1
    fi
else
    echo "❌ Error: mongodump not found. Please install mongodb-database-tools."
    exit 1
fi
