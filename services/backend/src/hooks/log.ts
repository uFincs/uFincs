// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
import util from "util";
import {HookContext} from "@feathersjs/feathers";
import logger from "logger";

const log = () => (context: HookContext) => {
    // This debugs the service call and a stringified version of the hook context.
    // You can customize the message (and logger) to your needs.
    logger.debug(`${context.type} app.service("${context.path}").${context.method}()`);

    // @ts-ignore Allow toJSON on context.
    if (typeof context.toJSON === "function" && logger.level === "debug") {
        logger.debug("Hook Context", util.inspect(context, {colors: false}));
    }

    if (context.error && !context.result) {
        logger.error(context.error.stack);
    }
};

export default log;
