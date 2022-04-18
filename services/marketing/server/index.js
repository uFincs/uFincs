const express = require("express");
const next = require("next");
const {errorLogger, successLogger} = require("./requestLogger");

const port = 3000;

const app = next({dev: false});
const handle = app.getRequestHandler();

const gracefulShutdown = (server, signal) => () => {
    console.log(`${signal} received; shutting down.`);

    server.close(() => {
        console.log("HTTP connections closed.");
        console.log("Exiting.");

        process.exit(0);
    });
};

app.prepare().then(() => {
    const app = express();

    app.use(errorLogger);
    app.use(successLogger);

    app.get("/healthz", (req, res) => {
        res.send("1");
    });

    app.all("*", (req, res) => {
        return handle(req, res);
    });

    const server = app.listen(port, (err) => {
        if (err) {
            throw err;
        }

        console.log(`Marketing listening on port ${port}`);
    });

    ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
        process.on(signal, gracefulShutdown(server, signal));
    });
});
