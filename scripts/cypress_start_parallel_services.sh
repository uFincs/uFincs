#!/bin/bash

# For the Make command, we want to split the tmux panes since that's the faster default workflow.
# But for high computing scenarios, we want to manually split the panes so that we can have more instances.
#
# Just pass "yes" as the first argument to split the panes, and anything else to not split the panes.
SPLIT_TMUX=${1:-"no"}

NUMBER_OF_INSTANCES=${2:-16}

if [ "$SPLIT_TMUX" = "yes" ]; then
    # Note: Because of how tmux splits windows, I don't exactly know how to write an algo to
    # perfectly split it vertically/horizontally such that it matches an input number of instances.
    # So... just update this whenever we want to use more.
    #
    # Note: The pane IDs (i.e. `-t ID`) change as more panes are created. The panes always get
    # re-numbered starting from top-left to bottom-right.

    # Split in half, creating top and bottom halfs.
    tmux split-window -t 0 -v -p 50

    # Split top half to create top-left and top-right quandrants.
    tmux split-window -t 0 -h -p 50

    # Split bottom half to create bottom-left and bottom-right quandrants.
    tmux split-window -t 2 -h -p 50

    # Split each quadrant in half to create top/bottom halfs in each quadrant.
    tmux split-window -t 0 -v -p 50 # Top-left quadrant
    tmux split-window -t 2 -v -p 50 # Top-right quadrant
    tmux split-window -t 4 -v -p 50 # Bottom-left quadrant
    tmux split-window -t 6 -v -p 50 # Bottom-right quadrant

    # Split each quadrant's half in half again to get the final layout.
    tmux split-window -t 0 -v -p 50  # Top-left quadrant top
    tmux split-window -t 2 -v -p 50  # Top-left quadrant bottom
    tmux split-window -t 4 -v -p 50  # Top-right quadrant top
    tmux split-window -t 6 -v -p 50  # Top-right quadrant bottom
    tmux split-window -t 8 -v -p 50  # Bottom-Left quadrant top
    tmux split-window -t 10 -v -p 50 # Bottom-left quadrant bottom
    tmux split-window -t 12 -v -p 50 # Bottom-right quadrant top
    tmux split-window -t 14 -v -p 50 # Bottom-right quadrant bottom
fi

for i in $(seq $NUMBER_OF_INSTANCES); do
    # Run each instance in a separate tmux pane. This way, we can inspect the logs
    # for each instance more easily, and I've found it to be more stable.
    tmux send-keys -t $((i - 1)) "bash ./scripts/cypress_start_parallel_service.sh $i" C-m

    # Starting lots of instances at once can end... poorly.
    # Give each a little bit of time to spin up.
    sleep 3
done
