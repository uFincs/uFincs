import {Sequelize} from "sequelize";
import app from "./app";
import logger from "./logger";

const port = app.get("port");
const server = app.listen(port);

const gracefulShutdown = (signal: string) => {
    const sequelize: Sequelize = app.get("sequelizeClient");

    return () => {
        logger.info(`${signal} received; shutting down.`);

        server.close(() => {
            logger.info("HTTP connections closed.");

            sequelize.close().then(() => {
                logger.info("Database connections closed.");
                logger.info("Exiting.");

                process.exit(0);
            });
        });
    };
};

server.on("listening", () =>
    logger.info("Feathers application started on http://%s:%d", app.get("host"), port)
);

process.on("unhandledRejection", (reason, p) =>
    logger.error("Unhandled Rejection at: Promise ", p, reason)
);

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, gracefulShutdown(signal));
});
