import configuration from "@feathersjs/configuration";
import express from "@feathersjs/express";
import feathers from "@feathersjs/feathers";

import compress from "compression";
import cors from "cors";
import helmet from "helmet";

import appHooks from "./app.hooks";
import authentication from "./authentication";
import channels from "./channels";
import sequelize from "./db";
import {Application} from "./declarations";
import logger from "./logger";
import middleware, {rateLimiter} from "./middleware";
import {errorLogger, successLogger} from "./requestLogger";
import services from "./services";
import customRoutes from "./values/customRoutes";
import {CORS_URLS} from "./values/servicesConfig";

// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());

// Setup security.
app.use(helmet());

// Setup request loggers.
app.use(errorLogger);
app.use(successLogger);

// Setup CORS.
app.use(cors({origin: CORS_URLS}));
app.options("*", cors({origin: CORS_URLS}));

// Setup compression.
app.use(compress());

// Setup JSON parsing.
app.use(
    express.json({
        limit: "10mb",
        verify: (req: any, res, buf) => {
            // The Stripe webhook requires the raw string version of the request body in order
            // to do the signing verification.
            if (req.originalUrl.startsWith(customRoutes.billing.webhook)) {
                req.rawBody = buf.toString();
            }
        }
    })
);

app.use(express.urlencoded({extended: true}));

// Trust the proxy so that rate limiters don't rate limit the proxy.
app.set("trust proxy", true);

// Register a healthcheck route for the frontend to check for connectivity.
// Note that rate limiting the healthcheck endpoint effectively means that users can only use
// the frontend client so much before they get kicked 'offline'. This is good to prevent abusive users.
app.get("/healthz", rateLimiter("lenient"), (req, res) => res.send("1"));

// Set up Plugins and providers
app.configure(express.rest());

app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);

// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({logger} as any));

app.hooks(appHooks);

export default app;
