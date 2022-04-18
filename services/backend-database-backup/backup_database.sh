#!/bin/sh

set -e

DUMP_FILE="$NAMESPACE-database-backup-`date +%Y-%m-%d-%H-%M-%S`.dump"
echo "Creating dump: $DUMP_FILE"

pg_dump -w --blobs > $DUMP_FILE

if [ $? -ne 0 ]; then
    rm $DUMP_FILE
    echo "Backup not created; check db connection settings"
    exit 1
fi

ENCRYPTED_DUMP_FILE="$DUMP_FILE.encrypted"
echo "Encrypting dump to: $ENCRYPTED_DUMP_FILE"

# $ENCRYPTION_KEY is provided as an env var from a Kubernetes secret.
#
# Need `--batch`, `--yes`, and `--passphrase-fd 0` to enable piping in the passphrase from cat.
# See https://unix.stackexchange.com/a/68726 for reference.
echo "$ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 --symmetric --cipher-algo AES256 -o $ENCRYPTED_DUMP_FILE $DUMP_FILE

# $BACKUP_BUCKET, $BACKUP_BUCKET_AWS and $NAMESPACE are provided as env vars by the cronjob resource.
GCS_BUCKET="gs://$BACKUP_BUCKET/$NAMESPACE/"
S3_BUCKET="s3://$BACKUP_BUCKET_AWS/$NAMESPACE/"

echo "Saving backup to GCS: $GCS_BUCKET"
gsutil cp $ENCRYPTED_DUMP_FILE $GCS_BUCKET

echo "Saving backup to S3: $S3_BUCKET"
aws s3 cp $ENCRYPTED_DUMP_FILE $S3_BUCKET

# Cleanup files.
rm $DUMP_FILE
rm $ENCRYPTED_DUMP_FILE

echo "Successfully backed up"
exit 0
