#!/usr/bin/env bash

set -e

HEAD="$(
    cat <<EOF
HTTP/1.1 200 OK
Connection: keep-alive\r\n\r\n
EOF
)"

echo -en "$HEAD"

echo "Syncing backups to S3..."
gsutil -m rsync -r "$GCS_BUCKET_PATH" "$S3_BUCKET_PATH"
echo "Finished syncing backups to S3."
