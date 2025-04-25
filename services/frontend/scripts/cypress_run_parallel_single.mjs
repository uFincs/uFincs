#!/usr/bin/env node

/* This scripts is a Node port of `cypress_run_parallel_single.sh`.
 * The script was rewritten so that it'd work on MacOS. */

import {spawn} from "child_process";
import fs from "fs/promises";
import path from "path";
import lockfile from "proper-lockfile";

// --- Configuration ---
const SPECS_FOLDER = "cypress/tempIntegration";
const FIFO = ".cypress-fifo";
const FIFO_LOCK = ".cypress-fifo-lock";
const LOGS = ".cypress-logs";
const LOGS_LOCK = ".cypress-logs-lock";
const MAX_RETRIES = 3; // Number of retries for cypress command
const RETRY_FAIL_DURATION_THRESHOLD_S = 30; // If failed command took longer than this, don't retry

// --- Utility Functions ---

// Simple sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if a file exists
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw error; // Re-throw other errors
    }
}

// Check if a directory exists
async function dirExists(dirPath) {
    try {
        const stats = await fs.stat(dirPath);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }
        throw error; // Re-throw other errors
    }
}

// Ensure lock files exist for proper-lockfile
async function ensureLockFiles() {
    if (!(await fileExists(FIFO_LOCK))) await fs.writeFile(FIFO_LOCK, "");
    if (!(await fileExists(LOGS_LOCK))) await fs.writeFile(LOGS_LOCK, "");
}

// Acquire a lock with retries
async function acquireLock(lockPath, options = {}) {
    try {
        // console.log(`Worker ${process.env.INSTANCE_INDEX || 'N/A'}: Attempting to acquire lock ${lockPath}`);
        const release = await lockfile.lock(lockPath, {
            retries: {
                retries: 5,
                factor: 2,
                minTimeout: 100,
                maxTimeout: 500
            },
            realpath: false, // Important if lockfile might be removed
            ...options
        });
        // console.log(`Worker ${process.env.INSTANCE_INDEX || 'N/A'}: Acquired lock ${lockPath}`);
        return release;
    } catch (err) {
        console.error(
            `Worker ${process.env.INSTANCE_INDEX || "N/A"}: Failed to acquire lock ${lockPath}:`,
            err
        );
        throw err; // Propagate the error
    }
}

// --- Initialization ---
async function initializeQueue() {
    let release;
    try {
        // Use FIFO_LOCK to ensure only one instance initializes
        release = await acquireLock(FIFO_LOCK);

        if (!(await fileExists(FIFO))) {
            console.log("Initializing queue...");
            const specs = await fs.readdir(SPECS_FOLDER);
            if (specs.length === 0) {
                console.warn(`Warning: No spec files found in ${SPECS_FOLDER}.`);
            }

            // Create files
            await fs.writeFile(FIFO, specs.join("\n") + (specs.length > 0 ? "\n" : ""));
            await fs.writeFile(LOGS, ""); // Create or truncate logs file
            // Lock files are created by ensureLockFiles or acquireLock if needed

            console.log(`Queue initialized with ${specs.length} specs.`);
        }
    } catch (error) {
        // If initialization lock failed or other error during init
        console.error("Error during queue initialization check:", error);
        // Check if FIFO exists now (maybe another process succeeded)
        if (!(await fileExists(FIFO))) {
            // If FIFO *still* doesn't exist, it's a real problem.
            throw new Error(`Queue initialization failed and FIFO file (${FIFO}) was not created.`);
        } else {
            console.log("FIFO file exists, proceeding...");
        }
    } finally {
        if (release) {
            await release();
            // console.log(`Worker ${process.env.INSTANCE_INDEX || 'N/A'}: Released init lock ${FIFO_LOCK}`);
        }
    }
}

// --- Job Function ---
async function job(index, spec) {
    const command = "npm";
    // Note: Constructing CYPRESS_* env vars from index isn't directly in the bash
    // script logic provided (it's commented out/static). Adapting slightly.
    // If you need dynamic ports based on index, adjust here.
    const cypressEnv = {
        ...process.env, // Inherit existing env vars
        CYPRESS_PROJECT_NAME: `cypress${index}`,
        CYPRESS_BACKEND_PORT: `500${index}`,
        CYPRESS_FRONTEND_PORT: `300${index}`
    };
    const args = [
        "run",
        "cypress",
        "--",
        "--config",
        `baseUrl=http://localhost:300${index},integrationFolder=${SPECS_FOLDER}`, // Keep baseUrl static as per bash
        "--spec",
        path.join(SPECS_FOLDER, spec) // Use path.join
    ];

    let retries = 0;
    let success = false;
    let finalExitCode = 1; // Default to failure
    let logs = "";

    console.log(`Worker ${index}: Starting job for spec "${spec}"`);

    while (retries < MAX_RETRIES && !success) {
        const currentAttempt = retries + 1;
        const startTime = Date.now();
        let currentLogs = ""; // Logs for this attempt
        let attemptExitCode = 1; // Exit code for this attempt

        try {
            await new Promise((resolve, reject) => {
                console.log(
                    // eslint-disable-next-line max-len
                    `Worker ${index}: Running command (attempt ${currentAttempt}/${MAX_RETRIES}): ${command} ${args.join(
                        " "
                    )}`
                );
                const child = spawn(command, args, {
                    env: cypressEnv,
                    stdio: ["ignore", "pipe", "pipe"] // stdin, stdout, stderr
                });

                // --- Stream Output & Capture Logs ---
                const captureAndLog = (stream, prefix = "") => {
                    stream.on("data", (data) => {
                        const dataStr = data.toString();
                        process.stdout.write(prefix + dataStr); // Log to console in real-time
                        currentLogs += dataStr; // Capture for file logging
                    });
                };

                captureAndLog(child.stdout);
                captureAndLog(child.stderr, "STDERR: "); // Prefix stderr

                child.on("error", (err) => {
                    console.error(`Worker ${index}: Failed to start subprocess:`, err);
                    currentLogs += `\n\nERROR: Failed to start subprocess: ${err.message}\n`;
                    attemptExitCode = -1; // Indicate spawn error
                    reject(err); // Reject promise on spawn error
                });

                child.on("close", (code) => {
                    attemptExitCode = code;
                    console.log(
                        `Worker ${index}: Command finished with exit code ${code} (attempt ${currentAttempt})`
                    );
                    resolve(); // Resolve promise when process closes
                });
            });
        } catch (error) {
            // Handle the spawn error if 'error' event triggered reject
            if (attemptExitCode === -1) {
                console.error(
                    `Worker ${index}: Subprocess execution failed (attempt ${currentAttempt}).`
                );
                // Log is already captured by the event handler
            } else {
                // Should not happen if 'close' always fires, but good practice
                console.error(
                    `Worker ${index}: Unexpected error during command execution (attempt ${currentAttempt}):`,
                    error
                );
                currentLogs += `\n\nUNEXPECTED ERROR: ${error.message}\n`;
                attemptExitCode = -2; // Indicate unexpected error
            }
        }

        const endTime = Date.now();
        const durationSeconds = (endTime - startTime) / 1000;
        logs += `\n--- Attempt ${currentAttempt} (Code: ${attemptExitCode}, Duration: ${durationSeconds.toFixed(
            2
        )}s) ---\n${currentLogs}`; // Append attempt logs

        if (attemptExitCode === 0) {
            console.log(`Worker ${index}: Spec "${spec}" tests SUCCEEDED.`);
            success = true;
            finalExitCode = 0;
        } else {
            // Check retry conditions (mirroring bash logic)
            if (attemptExitCode > 0 && durationSeconds > RETRY_FAIL_DURATION_THRESHOLD_S) {
                console.log(
                    // eslint-disable-next-line max-len
                    `Worker ${index}: Spec "${spec}" tests FAILED (duration > ${RETRY_FAIL_DURATION_THRESHOLD_S}s). Not retrying.`
                );
                finalExitCode = attemptExitCode; // Keep the actual failure code
                break; // Exit retry loop
            } else if (currentAttempt >= MAX_RETRIES) {
                console.log(
                    `Worker ${index}: Spec "${spec}" command failed after ${MAX_RETRIES} attempts. Giving up.`
                );
                finalExitCode = attemptExitCode; // Keep the last failure code
                break; // Exit retry loop
            } else {
                console.log(
                    // eslint-disable-next-line max-len
                    `Worker ${index}: Spec "${spec}" command failed (Code: ${attemptExitCode}, Duration: ${durationSeconds.toFixed(
                        2
                    )}s). Retrying...`
                );
                retries++;
                await sleep(1000); // Optional: wait a bit before retrying
            }
        }
    } // End retry while loop

    // --- Append Logs to File ---
    let logRelease;
    try {
        logRelease = await acquireLock(LOGS_LOCK);

        // eslint-disable-next-line max-len
        const logHeader = `\n\n####### Worker ${index} for spec ${spec} (Final Code: ${finalExitCode}, Success: ${success}) #######\n\n`;

        await fs.appendFile(LOGS, logHeader + logs + "\n");
    } catch (err) {
        console.error(`Worker ${index}: FAILED to acquire log lock or append to ${LOGS}:`, err);
    } finally {
        if (logRelease) {
            await logRelease();
            // console.log(`Worker ${index}: Released log lock ${LOGS_LOCK}`);
        }
    }
    console.log(`Worker ${index}: Finished job for spec "${spec}"`);
}

// --- Worker Function ---
async function work(id) {
    console.log(`Worker ${id}: Started`);

    while (true) {
        let release;
        let workItem = null;
        let queueEmpty = false;
        let fifoExists = true;

        try {
            release = await acquireLock(FIFO_LOCK);

            if (!(await fileExists(FIFO))) {
                console.log(`Worker ${id}: FIFO file ${FIFO} not found. Assuming queue is done.`);
                fifoExists = false;
                queueEmpty = true;
            } else {
                const fifoContent = await fs.readFile(FIFO, "utf-8");
                const lines = fifoContent.split("\n").filter((line) => line.trim() !== ""); // Filter empty lines

                if (lines.length > 0) {
                    workItem = lines[0]; // Get the first spec
                    const remainingSpecs = lines.slice(1);
                    await fs.writeFile(
                        FIFO,
                        remainingSpecs.join("\n") + (remainingSpecs.length > 0 ? "\n" : "")
                    ); // Write back remaining
                    console.log(`Worker ${id}: Claimed work item "${workItem}"`);
                } else {
                    console.log(`Worker ${id}: FIFO file ${FIFO} is empty.`);
                    queueEmpty = true;
                    // Attempt to remove the FIFO file here like the bash script
                    // Although, it might be better to remove it *after* the loop
                    try {
                        // console.log(`Worker ${id}: Attempting to remove empty FIFO ${FIFO}`);
                        await fs.unlink(FIFO);
                    } catch (rmErr) {
                        if (rmErr.code !== "ENOENT") {
                            // Ignore if already removed
                            console.error(`Worker ${id}: Error removing FIFO ${FIFO}:`, rmErr);
                        }
                    }
                    // Also attempt to remove the lock file (as per bash logic)
                    try {
                        // console.log(`Worker ${id}: Attempting to remove FIFO lock ${FIFO_LOCK}`);
                        // Release MUST happen *before* removing the lock file itself
                        // if (release) {
                        //     await release();
                        //     release = null; // Prevent double release in finally
                        // }
                        // await fs.unlink(FIFO_LOCK); // Let proper-lockfile manage staleness instead
                        console.log(
                            `Worker ${id}: Keeping FIFO lock file ${FIFO_LOCK} for proper-lockfile.`
                        );
                    } catch (rmErr) {
                        if (rmErr.code !== "ENOENT") {
                            console.error(
                                `Worker ${id}: Error removing FIFO lock ${FIFO_LOCK}:`,
                                rmErr
                            );
                        }
                    }
                }
            }
        } catch (err) {
            if (err.code === "ELOCKED") {
                console.log(`Worker ${id}: Could not acquire FIFO lock, will retry.`);
                // Release lock just in case (though it shouldn't be held)
                if (release) await release().catch(() => {});
                await sleep(500 + Math.random() * 500); // Wait randomly before retrying lock
                continue; // Retry the loop
            } else if (err.code === "ENOENT" && !fifoExists) {
                // This is expected if another worker deleted the FIFO
                console.log(
                    `Worker ${id}: FIFO file disappeared, likely processed by another worker.`
                );
                queueEmpty = true;
            } else {
                console.error(`Worker ${id}: Error processing FIFO queue:`, err);
                // Decide if we should break or retry after a delay
                await sleep(1000); // Wait before potential retry or exit
                queueEmpty = true; // Assume queue is unusable now
            }
        } finally {
            if (release) {
                await release().catch((err) =>
                    console.error(`Worker ${id}: Error releasing FIFO lock:`, err)
                );
                // console.log(`Worker ${id}: Released FIFO lock ${FIFO_LOCK}`);
                release = null;
            }
        }

        // If queue is empty or FIFO gone, exit the loop
        if (queueEmpty) {
            break;
        }

        // If we got a work item, run the job
        if (workItem) {
            try {
                await job(id, workItem);
            } catch (jobError) {
                // Errors within job() should be handled internally (like logging)
                // But catch here just in case to prevent worker death
                console.error(
                    `Worker ${id}: UNHANDLED error during job execution for "${workItem}":`,
                    jobError
                );
            }
        }
        // Small delay to prevent overly aggressive lock contention if queue is processed fast
        await sleep(50);
    } // End while loop

    console.log(`Worker ${id}: Done working`);
}

// --- Main Execution ---
(async () => {
    // Read instance index from command line args (argv[2] is the first arg after script name)
    const instanceIndex = process.argv[2] || "1";
    process.env.INSTANCE_INDEX = instanceIndex; // Make it available globally if needed, e.g., for logging

    console.log(`Starting Cypress Queue Worker - Instance ${instanceIndex}`);

    try {
        // 1. Check if specs folder exists
        if (!(await dirExists(SPECS_FOLDER))) {
            console.error(
                `Spec folder "${SPECS_FOLDER}" not found. Run the splitting script first.`
            );
            process.exit(1);
        }

        // 2. Ensure lock files exist before first lock attempt
        await ensureLockFiles();

        // 3. Initialize queue if needed (atomic via lock)
        await initializeQueue();

        // 4. Start the worker
        await work(instanceIndex);

        console.log(`Worker ${instanceIndex}: Finished successfully.`);
        process.exit(0);
    } catch (error) {
        console.error(`Worker ${instanceIndex}: An unrecoverable error occurred:`, error);
        process.exit(1);
    }
})();
