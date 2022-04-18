#!/bin/sh

ret_code=$1

if [ $ret_code -ne 0 ]; then
    kubails infra unauthenticate
fi

exit $ret_code
