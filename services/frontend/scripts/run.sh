#!/bin/sh

# Use exec so that the NPM command receives all signals,
# so that the container actually stops properly when signalled to.
# (e.g. when killing docker-compose)
# For reference: https://blog.true-kubernetes.com/why-does-my-docker-container-take-10-seconds-to-stop/
exec npm start;
