import {API, Service, ServiceMethod} from "./feathers.types";

/** Note: The following was written near the very beginning of the project.
 *  Probably doesn't even crack top 5 for hackiest things I've done now, but I leave
 *  the message here for posterity's sake.
 *
 *  The following is quite possibly one of the hackiest things I've ever done.
 *
 *  What this is doing:
 *
 *      This is iterating through every feathers service's API method and explicitly
 *      binding it back to the service itself.
 *
 *  Why this is being done:
 *
 *      When calling one of the service methods using redux-saga's `yield call()`,
 *      the service method has `this` point to `window` because the service method is being
 *      invoked as a callback as opposed to a direct function call.
 *
 *      As an example, running `yield call(api.service("users").create, {email, password})` in a saga
 *      would result in the following error: `TypeError: Cannot read property 'before' of undefined`.
 *
 *      The `undefined` here would end up being some `__hooks` property on a `this` instance. The `this`
 *      instance ends up pointing to `window` as opposed to `api.service("users")` because the method
 *      is being used as a callback, and Feathers didn't use arrow functions for the service methods.
 *
 *      Therefore, the fix is just to rebind `create` (and all the other service methods) back to
 *      the service.
 *
 *  Implementation Note:
 *
 *      The list of services has to be explicitly defined before the rebinding can happen.
 *      This is because the `api.services` property seems to be computed at a later time (probably getting
 *      it from the backend), so it isn't immediately filled with the list of services when we want it.
 *
 *      Therefore, we must remember to add new services to this list as they are created.
 *      Which, considering the alternative, isn't all that bad.
 *
 *      And just so we're clear, the alternative is to either:
 *
 *          1. Abstract over the feathers API with a separate 'api access layer', OR
 *          2. Not use feathers and just write a whack ton of direct API call methods using fetch.
 */

const services: Array<Service> = [
    "accounts",
    "authManagement",
    "featureFlags",
    "feedback",
    "importProfiles",
    "importRules",
    "preferences",
    "recurringTransactions",
    "transactions",
    "users"
];

const serviceMethods: Array<ServiceMethod> = ["find", "get", "create", "update", "patch", "remove"];

const bindServices = (api: API) =>
    services.forEach((service) => {
        serviceMethods.forEach((method) => {
            api.service(service)[method] = api.service(service)[method].bind(api.service(service));
        });
    });

export default bindServices;
