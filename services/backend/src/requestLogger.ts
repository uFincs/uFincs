import morgan from "morgan";
import logger from "./logger";

// Need the response time in seconds, because that's what StackDriver expects.
morgan.token("response-time-seconds", function (req, res) {
    // @ts-ignore Doesn't like `this`.
    return `${this["response-time"](req, res) / 1000}`;
});

// Use a cache for all JWTs that come through so that we don't need to parse out the userId for existing
// JWTs every time (cache hit is ~5x faster than a cache miss).
//
// What's the cache invalidation mechanism? Uh... node preemptions. AKA, there isn't (an explicit) one.
const jwtCache: Record<string, string> = {};

morgan.token("user-id", (req) => {
    const jwt = req.headers["authorization"];

    if (jwt) {
        try {
            if (jwt in jwtCache) {
                return jwtCache[jwt];
            } else {
                const base64UserData = jwt.split(".")[1];

                const userData = JSON.parse(
                    Buffer.from(base64UserData, "base64").toString("ascii")
                );

                const userId = userData.sub;

                jwtCache[jwt] = userId;

                return userId;
            }
        } catch (e) {
            logger.error(e);
            return undefined;
        }
    } else {
        return undefined;
    }
});

const baseFormat = {
    timestamp: ":date[iso]",
    userId: ":user-id",
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

export const successLogger = morgan(successFormat, {
    skip: (req, res) => res.statusCode >= 400
});

export const errorLogger = morgan(errorFormat, {
    skip: (req, res) => res.statusCode < 400
});
