#!/bin/sh

project_name=$(kubails config get __project_name | tr -d '"')
service_name="backend"
secret_base_name="stripe-webhook-secret"
secret_placeholder="__WEBHOOK_SECRET_VALUE__"

project_id=$1
stripe_api_key_test=$2
stripe_api_key_prod=$3

namespace=$(echo "$4" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.
production_namespace=$(kubails config get __production_namespace | tr -d '"')

stripe_api_key=$stripe_api_key_test

if [ "$namespace" = "$production_namespace" ]; then
    # Use the prod Stripe key if we're deploying to production.
    stripe_api_key=$stripe_api_key_prod
fi

# Try to retrieve the secret from Secret Manager.
webhook_secret=$(gcloud secrets versions access latest --secret="${namespace}-${secret_base_name}")
result=$?

# We can expect the above command to fail, so once we're past it, any commands that fail
# are a true failure and the script should fail.
set -e

# If the command exited with an error code (i.e. code > 0), then the secret doesn't yet exist.
if [ $result -gt 0 ]; then
    # Create the secret by running the script from the Backend service.
    webhook_secret=$(docker run gcr.io/${project_id}/${project_name}-${service_name}:${namespace} \
        scripts/create-stripe-webhook.js ${namespace} ${stripe_api_key_test} ${stripe_api_key_prod})

    echo "Created webhook for namespace ${namespace}."

    # Save the secret to Secret Manager for use by later builds.
    echo -n $webhook_secret | gcloud secrets create ${namespace}-${secret_base_name} --data-file=-

    echo "Saved webhook secret."
fi

# Inject in the webhook secret to the environment variable for the Backend service. 
sed -i -e "s/${secret_placeholder}/${webhook_secret}/g" ./kubails.json

echo "Injected webhook secret for namespace ${namespace} to ${service_name} service."