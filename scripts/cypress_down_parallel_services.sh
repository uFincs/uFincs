#!/bin/bash

NUMBER_OF_INSTANCES=${1:-16}

for i in $(seq $NUMBER_OF_INSTANCES); do
    bash ./scripts/cypress_down_parallel_service.sh $i &
done

wait
