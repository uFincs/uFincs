#!/bin/sh

GCP_REGION=$(kubails config get __gcp_project_region | tr -d '"')
KMS_KEY=$(kubails infra terraform output -- -json secrets_key_name | tr -d '"')
KMS_KEY_RING=$(kubails infra terraform output -- -json secrets_key_ring_name | tr -d '"')

PASSWORD_FILE=".database-password"
SECRET_PLACEHOLDER="__POSTGRES_PASSWORD__"

# Decrypt the password file.
gcloud kms decrypt --plaintext-file $PASSWORD_FILE --ciphertext-file ${PASSWORD_FILE}.encrypted \
    --location $GCP_REGION --keyring $KMS_KEY_RING --key $KMS_KEY

echo "Decrypted database password file."

DATABASE_PASSWORD=$(cat $PASSWORD_FILE)

# Inject the password into the environment variables for the services in `kubails.json`.
sed -i -e "s/${SECRET_PLACEHOLDER}/${DATABASE_PASSWORD}/g" ./kubails.json

echo "Injected database password into kubails.json."