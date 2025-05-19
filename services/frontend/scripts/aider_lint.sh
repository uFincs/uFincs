#!/bin/bash

set -e

processed_files=()
for file in "$@"; do
    # Remove the prefix "services/frontend/"
    cleaned_file="${file#services/frontend/}"
    processed_files+=("$cleaned_file")
done

# Do some prompt injection to inject the /no_think token into the lint output,
# so that aider uses it in the lint prompt.
echo "/no_think"

## 1. Lint with ESLint.

npx eslint "${processed_files[@]}"

## 2. Format with Prettier.

# Run it twice.
#
# First attempt may reformat/modify files, and therefore exit with non-zero status.
#
# Second attempt will not do anything and exit 0 unless there's a real problem beyond
# the code formatting that was completed.

npx prettier "${processed_files[@]}" >/dev/null ||
    npx prettier "${processed_files[@]}"
