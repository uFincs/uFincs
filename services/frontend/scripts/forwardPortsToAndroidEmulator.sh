#!/bin/sh

# This script forwards service ports from your host machine to the currently active
# Android emulator, so that the emulator can access the services over its own `localhost` without
# having to go through the host IP of `10.0.2.2`.

# Backend
adb reverse tcp:5000 tcp:5000

# Marketing
adb reverse tcp:3002 tcp:3002

# Forward the Frontend is useful if you uncomment the `server` block in `capacitor.config.ts`,
# since then the Capacitor app will use the live Frontend service as the source of its assets,
# effectively enabling live reload.

# Frontend
adb reverse tcp:3000 tcp:3000
