import {createLogger, format, transports} from "winston";

// StackDriver expects a 'severity' field instead of a 'level' field. Convert it.
const convertLevelToSeverity = format.printf((info) => {
    info.severity = info.level;

    // @ts-ignore
    delete info.level;

    return JSON.stringify(info);
});

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
    // To see more detailed errors, change this to 'debug'
    level: "info",
    format: format.combine(
        convertLevelToSeverity,
        format.timestamp(),
        format.splat(),
        format.json()
    ),
    transports: [new transports.Console()]
});

export default logger;
