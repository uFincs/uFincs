const {execFile} = require("child_process");

// Because the prod Dockerfile uses a 'distroless' image, it doesn't actually have NPM.
// As such, since all we really have access to is the Node runtime, we need a script to execute
// the migration steps.
//
// So that's what this is. It just calls the `sequelize` CLI directly from node_modules.

const TIMEOUT = 5000; // in milliseconds = 5 seconds

const runSequelize = async (arg = "", options = {}) => {
    return await new Promise((resolve, reject) => {
        const commandProcess = execFile(
            "/nodejs/bin/node",
            ["./node_modules/.bin/sequelize", arg],
            {env: process.env, ...options},
            (err) => (err ? reject(err) : resolve(true))
        );

        commandProcess.stdout.pipe(process.stdout);
        commandProcess.stderr.pipe(process.stderr);
    });
};

try {
    (async () => {
        let migrationSuccess = false;
        let migrationCount = 0;

        // Try migrating up to 5 times before failing out.
        // Really, this is just to handle the case where the database isn't ready yet.
        while (migrationCount < 5) {
            try {
                migrationSuccess = await runSequelize("db:migrate", {timeout: TIMEOUT});
            } catch (e) {
                console.error(e);
            } finally {
                migrationCount += 1;
            }
        }

        if (!migrationSuccess) {
            throw new Error("Migration failed.");
        }

        await runSequelize("db:seed:all");
    })();
} catch (e) {
    console.error(e);
    process.exit(1);
}
