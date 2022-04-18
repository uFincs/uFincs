const {execFile} = require("child_process");

// See db-migrate.js for why we need a script, rather than NPM, to run these commands.

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

(async () => {
    await runSequelize("db:drop");
    await runSequelize("db:create");

    await runSequelize("db:migrate", {env: {NODE_PATH: "lib"}});
    await runSequelize("db:seed:all", {env: {NODE_PATH: "lib"}});
})();
