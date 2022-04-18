#!/bin/sh

namespace=$(echo "$1" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

if [ "$namespace" = "master" ] || [ "$namespace" = "" ]; then
    namespace=""
else
    namespace="${namespace}."
fi

REACT_APP_BACKEND_HOST=${namespace}backend.ufincs.com REACT_APP_BACKEND_PORT=80 REACT_APP_BACKEND_PROTOCOL=https \
    REACT_APP_MARKETING_HOST=${namespace}ufincs.com REACT_APP_MARKETING_PORT=80 REACT_APP_MARKETING_PROTOCOL=80 \
    npm run cap:build
