#!/bin/bash

# Adapted from https://hackthology.com/a-job-queue-in-bash.html.

# Read in script params.
INSTANCE_INDEX=${1:-1}

SPECS_FOLDER="cypress/tempIntegration"

if [ ! -d "$SPECS_FOLDER" ]; then
    echo "Spec files have not been split yet; run the splitting script first."
    exit 1
fi

FIFO=".cypress-fifo"
FIFO_LOCK=".cypress-fifo-lock"
LOGS=".cypress-logs"
LOGS_LOCK=".cypress-logs-lock"

if [[ ! -f $FIFO ]]; then
    # Read in the list of spec files through the magic of bash arrays...
    # Stolen from: https://unix.stackexchange.com/a/302791
    readarray -t SPECS < <(ls $SPECS_FOLDER)

    # Make the files for storing the worker state.
    touch $FIFO
    touch $FIFO_LOCK
    touch $LOGS
    touch $LOGS_LOCK

    # Fill the fifo with jobs to run.
    for spec in ${SPECS[@]}; do
        echo $spec >>$FIFO
    done
fi

# This technique for redirecting command logs to variable while still printing to
# the terminal was adapted from https://stackoverflow.com/a/16292136.
#
# Here, we redirect the output from the file descriptor to STDOUT.
#
# Note: Need to use eval around exec in order to use variables for the file descriptors.
# Learned from: https://stackoverflow.com/a/8297755.
exec {FD_LOG_REDIRECTION}>&1

# This is the "job" function which is does whatever work the queue workers are supposed to be doing.
job() {
    index=$1
    spec=$2

    # Open the logs lock for reading.
    exec {FD_LOGS_LOCK}<$LOGS_LOCK

    command="CYPRESS_PROJECT_NAME=cypress${index} CYPRESS_BACKEND_PORT=500${index} \
        CYPRESS_FRONTEND_PORT=300${index} npm run cypress \
        -- --config baseUrl=http://localhost:300${index},integrationFolder=$SPECS_FOLDER --spec ${SPECS_FOLDER}/$spec"

    counter=0
    exit_flag=1

    # Retry the cypress command up to 3 times in case it errors out for high CPU usage reasons.
    until [ $exit_flag -eq 0 ]; do
        start=$(date +%s)

        # Here, we pipe the command output through the file descriptor so that it gets shown on screen,
        # while also saving the output to the $logs variable so that we can it to a file later.
        #
        # Note that, as a sad side effect, we lose colors on the output.
        #
        # The logic for preserving the exit_code was taken from https://stackoverflow.com/a/41943779.
        logs="$(
            eval $command 2>&1 | tee /dev/fd/$FD_LOG_REDIRECTION
            exit ${PIPESTATUS[0]}
        )"

        exit_code=$?

        end=$(date +%s)
        time_difference=$((end - start))

        if [ $exit_code -eq 0 ]; then
            # If the tests succeeded, exit the loop.
            echo "Exiting because of successful tests."
            exit_flag=0
        elif [ $exit_code -eq 1 ] && [ $time_difference -gt 30 ]; then
            # If the test command failed but it took more than 30 seconds, than that likely means that
            # an actual test failure occurred, rather than some sort of error.
            #
            # As such, exit the loop.
            echo "Exiting because of failed tests."
            exit_flag=0
        elif [ $counter -gt 2 ]; then
            # If we go beyond three tries, give up and exit the loop.
            echo "Exiting because of too many retries."
            exit_flag=0
        else
            echo "Test error for Worker $index with spec $spec; retrying."
            counter=$((counter + 1))
        fi
    done

    # Append the logs to the file.
    flock $FD_LOGS_LOCK
    echo -e "\n\n####### Worker $index for spec $spec #######\n\n" >>$LOGS
    echo -e "$logs" >>$LOGS
    flock -u $FD_LOGS_LOCK

    # Close the logs lock.
    exec {FD_LOGS_LOCK}<&-
}

# This is the worker to read from the queue.
work() {
    ID=$1

    # First open the lock for reading.
    exec {FD_FIFO_LOCK}<$FIFO_LOCK

    echo "Worker $ID started"

    while [[ -f $FIFO ]]; do
        flock $FD_FIFO_LOCK # Obtain the fifo lock

        read -r work_item <$FIFO # Read into work_item.
        read_status=$?           # Save the exit status of read.
        sed -i 1d $FIFO          # Remove the work item from the fifo.

        flock -u $FD_FIFO_LOCK # Release the fifo lock

        # Check the line read.
        if [[ $read_status -eq 0 ]]; then
            # Run the job in a subshell. That way any exit calls do not kill the worker process.
            (job "$ID" "$work_item")
        else
            # Any other exit code indicates an EOF.
            break
        fi
    done

    # Clean up the files.
    flock $FD_FIFO_LOCK
    rm $FIFO 2>/dev/null      # Remove the fifo file.
    rm $FIFO_LOCK 2>/dev/null # Remove the lock.
    flock -u $FD_FIFO_LOCK

    exec {FD_FIFO_LOCK}<&- # Close the lock.

    echo "Worker $ID done working"
}

# Start the worker.
work $INSTANCE_INDEX

# Close the log redirection.
exec {FD_LOG_REDIRECTION}<&-
