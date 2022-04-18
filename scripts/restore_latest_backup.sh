#!/bin/sh

set -e

NAMESPACE=$(echo "$1" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.
PRODUCTION_NAMESPACE=$(kubails config get __production_namespace | tr -d '"') # Remove quotes.

# DO NOT RESTORE TO PRODUCTION. Things will go very poorly if this happens.
if [ "$NAMESPACE" = "$PRODUCTION_NAMESPACE" ]; then
    echo "Not restoring on $PRODUCTION_NAMESPACE. Exiting."
    exit 0
fi

# Note: Ideally this script would somehow be integrated into Kubails so that it could leverage the config.
#
# Alternatively, we'd need to modify `kubails config get` to support array based path accessors, cause
# all of the following fields are unfortunately stored in an `env` array.

PROJECT_NAME=$(kubails config get __gcp_project_id | tr -d '"')
BACKUP_BUCKET="$PROJECT_NAME-cluster-database-backups"
DATABASE_USER="app-database-user"
DATABASE="app-database"

echo "Will restore latest backup to $NAMESPACE."

# Get the latest prod backup.
# Need to grep for `encrypted` to make sure we're only getting the encrypted backups.
# This is relevant because, at the time of writing this script, encrypted backups were just implemented.
LATEST_BACKUP=$(gsutil ls gs://$BACKUP_BUCKET/$PRODUCTION_NAMESPACE | grep encrypted | tail -n1)
echo "The latest $PRODUCTION_NAMESPACE backup is: $LATEST_BACKUP"

# Grab the file.
gsutil cp $LATEST_BACKUP .
LATEST_BACKUP_FILE=$(basename "$LATEST_BACKUP")

# Get the decryption key.
DECRYPTED_FILE="backup-secrets"

gcloud kms decrypt --ciphertext-file ./services/backend-database-backup/.env.encrypted --plaintext-file $DECRYPTED_FILE --location us-east1 --keyring ${PROJECT_NAME}-key-ring --key ${PROJECT_NAME}-key

source $DECRYPTED_FILE
echo "Decrypted secrets file."

# Decrypt the backup.
# Note: $ENCRYPTION_KEY comes from `source`ing the secrets file above.
DUMP_FILE="database.dump"
echo "$ENCRYPTION_KEY" | gpg --batch --yes --passphrase-fd 0 --decrypt --cipher-algo AES256 $LATEST_BACKUP_FILE > $DUMP_FILE

echo "Decrypted backup."

# Copy the backup to the database.
POD_NAME=$(kubectl get pods -n $NAMESPACE -l run=backend-database --no-headers -o custom-columns=":metadata.name")
TMP_FOLDER="/tmp"

echo "Waiting for database $POD_NAME"
kubectl wait -n $NAMESPACE --for=condition=Ready pod/$POD_NAME

# Wait a bit more, just in case.
sleep 5

kubectl cp -n $NAMESPACE $DUMP_FILE "$POD_NAME:$TMP_FOLDER"
echo "Copied backup to database pod $POD_NAME."

# Drop and re-create the database.
kubectl exec -n $NAMESPACE $POD_NAME -- dropdb -U $DATABASE_USER $DATABASE
kubectl exec -n $NAMESPACE $POD_NAME -- createdb -U $DATABASE_USER $DATABASE

# Restore the backup.
kubectl exec -n $NAMESPACE $POD_NAME -- psql -U $DATABASE_USER -d $DATABASE -f "$TMP_FOLDER/$DUMP_FILE"

# Cleanup files.
rm $DECRYPTED_FILE
rm $LATEST_BACKUP_FILE
rm $DUMP_FILE

echo "Successfully restored latest backup!"
exit 0
