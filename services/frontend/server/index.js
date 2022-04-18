"use strict";

const app = require("./app");
const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log("Frontend listening on port " + PORT + ".");
});

const gracefulShutdown = (signal) => () => {
    console.log(`${signal} received; shutting down.`);

    server.close(() => {
        console.log("HTTP connections closed.");
        console.log("Exiting.");

        process.exit(0);
    });
};

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, gracefulShutdown(signal));
});
