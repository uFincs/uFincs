#!/bin/sh

set -e

project_name=$(kubails config get __project_name | tr -d '"')
service_name="backend"
secret_base_name="stripe-webhook-secret"

project_id=$1
stripe_api_key_test=$2
stripe_api_key_prod=$3
current_namespace=$(echo "$4" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

# Shift out the first 4 args (from above) so that all that's left in the args array
# is the namespaces that were cleaned up. This way, we can easily loop over them (below).
shift; shift; shift; shift;

# This is a shortcut that just loops over all of the (remaining) args.
# Found from https://unix.stackexchange.com/a/314041.
for arg
do
    namespace=$(echo "${arg}" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

    # Delete the actual webhook.
    docker run gcr.io/${project_id}/${project_name}-${service_name}:${current_namespace} \
        scripts/delete-stripe-webhook.js ${namespace} ${stripe_api_key_test} ${stripe_api_key_prod}

    # Delete the webhook's secret from Secret Manager.
    # Use --quiet so that it doesn't prompt for confirmation.
    gcloud secrets delete ${namespace}-${secret_base_name} --quiet

    echo "Deleted webhook for namespace ${namespace}."
done
