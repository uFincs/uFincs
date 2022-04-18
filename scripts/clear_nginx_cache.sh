#!/bin/sh

set -e

NAMESPACE=$(echo "$1" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

PRODUCTION_NAMESPACE=$(kubails config get __production_namespace | tr -d '"')
INGRESS_NAMESPACE=ingress-nginx

# If the NAMESPACE arg is empty, then that must mean we're invoking the script manually and we definitely
# want to clear the caches.
#
# Otherwise, it's being invoked in the build pipeline and should only clear on production.
if [ "$NAMESPACE" = "" ] || [ "$NAMESPACE" = "$PRODUCTION_NAMESPACE" ]; then
    echo "Clearing Nginx cache"

    for pod in $(kubectl get pods -n $INGRESS_NAMESPACE -o name); do
        kubectl exec -it -n $INGRESS_NAMESPACE $pod -- find /tmp/nginx_cache -type f -delete

        echo "Cleared cache for $pod"
    done
else
    echo "Skipping clearing Nginx cache; $NAMESPACE is not production"
fi
