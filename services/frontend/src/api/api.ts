import feathers from "@feathersjs/client";
import {BACKEND_URL} from "config";
import auth from "./auth";
import billing from "./billing";
import bindServices from "./bindServices";

const rest = feathers.rest(BACKEND_URL).fetch(fetch);
const api = feathers();

api.configure(rest);
api.configure(auth(BACKEND_URL));

bindServices(api);

// Setup custom services.
api.configure(billing);

export default api;
