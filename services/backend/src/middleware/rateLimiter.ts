import errors from "@feathersjs/errors";
import rateLimit from "express-rate-limit";
import {IS_PRODUCTION} from "values/servicesConfig";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

const timeLimits = {
    once: ONE_HOUR,
    aggressive: FIFTEEN_MINUTES,
    lenient: FIFTEEN_MINUTES
};

const maxRequests = {
    // Need higher limits in development for testing purposes;
    // wouldn't want to get rate limited while running e2e tests.
    once: IS_PRODUCTION ? 1 : 100,
    aggressive: IS_PRODUCTION ? 10 : 1000,
    lenient: IS_PRODUCTION ? 200 : 20000
} as const;

/** This is a rate limiter that can be thrown onto a route as an Express middleware.
 *  Particularly important to put this on unauthenticated routes so that users can't abuse our resources. */
const rateLimiter = (
    type: "once" | "aggressive" | "lenient" = "aggressive",
    // Skipping successful requests is particularly useful when dealing with the authentication service.
    // We want to rate limit failed login attempts, but not successful ones.
    {skipSuccessfulRequests = false} = {}
) =>
    rateLimit({
        windowMs: timeLimits[type],
        max: maxRequests[type],
        skipSuccessfulRequests,

        // We want the 'message' to be a Feathers error so that the Frontend can parse it correctly.
        //
        // Need to ignore TypeScript errors because `message` doesn't explicitly accept the Feathers
        // error object, but does accept arbitrary JSON. We _could_ JSON.parse(JSON.stringify()) it,
        // but there's no real point to that.
        //
        // @ts-ignore
        message: new errors.TooManyRequests("Too many requests. Try again later.")
    });

export default rateLimiter;
