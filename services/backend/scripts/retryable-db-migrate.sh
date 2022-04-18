#!/bin/sh

n=0

# Tries up to 5 times to perform the migrations
until [ $n -ge 5 ]
do
    # Note that this 'timeout' is BusyBox's latest version of 'timeout',
    # which uses a different syntax for specifying the time.
    # Bash uses `timeout -t 5`, BusyBox uses `timeout 5`.
    timeout 5 npm run db:migrate && break

    n=$((n+1))
    sleep 2
done
