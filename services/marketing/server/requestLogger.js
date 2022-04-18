const morgan = require("morgan");

// Need the response time in seconds, because that's what StackDriver expects.
morgan.token("response-time-seconds", function (req, res) {
    return `${this["response-time"](req, res) / 1000}`;
});

const baseFormat = {
    timestamp: ":date[iso]",
    httpRequest: {
        requestMethod: ":method",
        requestUrl: ":url",
        status: ":status",
        requestSize: ":req[content-length]",
        responseSize: ":res[content-length]",
        userAgent: ":user-agent",
        remoteIp: ":remote-addr",
        referer: ":referrer",
        latency: ":response-time-seconds s",
        protocol: "HTTP/:http-version"
    }
};

const successFormat = JSON.stringify({severity: "INFO", ...baseFormat});
const errorFormat = JSON.stringify({severity: "ERROR", ...baseFormat});

const successLogger = morgan(successFormat, {
    skip: (req, res) => res.statusCode >= 400
});

const errorLogger = morgan(errorFormat, {
    skip: (req, res) => res.statusCode < 400
});

module.exports = {
    successLogger,
    errorLogger
};
