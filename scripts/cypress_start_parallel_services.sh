#!/bin/bash

# Arguments:
# $1: Split tmux panes ("yes" or "no"). Default: "no"
# $2: Number of instances to run. Default: 16
SPLIT_TMUX=${1:-"no"}
NUMBER_OF_INSTANCES_INPUT=${2:-16} # Store original input for validation message

# --- Input Validation ---
# Ensure NUMBER_OF_INSTANCES is a positive integer
if ! [[ "$NUMBER_OF_INSTANCES_INPUT" =~ ^[1-9][0-9]*$ ]]; then
    echo "Error: NUMBER_OF_INSTANCES must be a positive integer. Got '$NUMBER_OF_INSTANCES_INPUT'."
    exit 1
fi
NUMBER_OF_INSTANCES=$NUMBER_OF_INSTANCES_INPUT
# --- End Input Validation ---

# Function to check if running inside tmux
is_in_tmux() {
    # Check if tmux command exists and if we are inside a tmux session ($TMUX is set)
    command -v tmux &>/dev/null && [ -n "$TMUX" ]
}

# --- Tmux Pane Splitting ---
if [ "$SPLIT_TMUX" = "yes" ]; then
    if ! is_in_tmux; then
        echo "Error: Not running inside a tmux session. Cannot split panes." >&2
        exit 1
    fi

    echo "Splitting tmux window into $NUMBER_OF_INSTANCES panes (re-tiling after each split)..."

    if [ "$NUMBER_OF_INSTANCES" -gt 1 ]; then
        # We start with 1 pane. Need to create N-1 additional panes.
        for ((i = 1; i < NUMBER_OF_INSTANCES; i++)); do
            # 1. Split the currently active pane (defaults to vertical)
            #    The new pane becomes active.
            tmux split-window

            # 2. Immediately apply a layout to redistribute space evenly
            #    This prevents the shrinking pane issue. 'tiled' is usually best.
            tmux select-layout tiled

            # 3. Add a *very* small pause. Applying layout might take a tiny moment,
            #    and helps ensure tmux is ready for the next command.
            #    Might not be strictly necessary but adds robustness.
            sleep 0.1 # Adjust if needed, usually 0.05 or 0.1 is fine

            # Optional: Log progress
            # echo "  Split $i/$((NUMBER_OF_INSTANCES - 1)), panes now: $((i + 1))"
        done

        # The final layout is already applied by the last loop iteration.
        # No need for an extra `select-layout tiled` here.

        # Verification step is still good practice
        current_panes=$(tmux list-panes | wc -l)
        if [ "$current_panes" -ne "$NUMBER_OF_INSTANCES" ]; then
            echo "Warning: After splitting loop, expected $NUMBER_OF_INSTANCES panes, but tmux reports $current_panes." >&2
            echo "         Check layout visually. Terminal might be too small for optimal tiling." >&2
            # exit 1 # Optional: Exit if count mismatch is critical
        else
            echo "Tmux window split iteratively, resulting in $current_panes tiled panes."
        fi
    else
        echo "NUMBER_OF_INSTANCES is 1, no tmux splitting needed."
    fi
else
    # ... (rest of the script: "splitting skipped" logic, command sending etc.) ...
    # (Make sure the command sending part still correctly checks 'is_in_tmux'
    # and verifies pane count if N > 1, as in the previous example)
    echo "Tmux splitting skipped (SPLIT_TMUX != 'yes')."
    if is_in_tmux; then
        current_panes=$(tmux list-panes | wc -l)
        if [ "$current_panes" -lt "$NUMBER_OF_INSTANCES" ]; then
            echo "Warning: SPLIT_TMUX is not 'yes'." >&2
            echo "         The current tmux window only has $current_panes panes, but $NUMBER_OF_INSTANCES are needed." >&2
            echo "         Ensure panes are prepared manually or run with SPLIT_TMUX=yes." >&2
            # exit 1 # Uncomment to make this a fatal error
        fi
    else
        if [ "$NUMBER_OF_INSTANCES" -gt 1 ]; then
            echo "Warning: Not running inside tmux and SPLIT_TMUX is not 'yes'." >&2
            echo "         Cannot target $NUMBER_OF_INSTANCES separate panes without tmux." >&2
            # exit 1 # Uncomment to make fatal
        fi
    fi
fi
# --- End Tmux Pane Splitting ---

# --- Run Commands in Panes ---
echo "Sending commands to $NUMBER_OF_INSTANCES panes..."
for i in $(seq 1 "$NUMBER_OF_INSTANCES"); do
    # Pane indices are 0-based
    pane_index=$((i - 1))

    # Construct the command specific to this script.
    # Make sure './scripts/cypress_start_parallel_service.sh' exists and is executable.
    # Using quotes around the script path can help if it ever contains spaces.
    command_to_run="bash ./scripts/cypress_start_parallel_service.sh $i"

    echo "Sending to pane $pane_index: $command_to_run"
    # Use -t {window}.{pane} for more robustness if needed, but simple pane index often works.
    tmux send-keys -t "$pane_index" "$command_to_run" C-m

    # Starting lots of instances at once can end poorly.
    # Give each a little bit of time to spin up.
    # Sleep after sending the command as in the original script.
    echo "Sleeping for 3 seconds..."
    sleep 3
done
# --- End Run Commands in Panes ---

echo "All commands sent."

# Optional: Select the first pane after sending commands
# tmux select-pane -t 0
