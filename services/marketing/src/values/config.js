import getConfig from "next/config";

const {publicRuntimeConfig} = getConfig();
const branch = publicRuntimeConfig?.branch || process.env.NEXT_PUBLIC_BRANCH;

const IS_MASTER = branch === "master";

let IS_PRODUCTION = true;
let FRONTEND_URL = "http://localhost:3000";
let MARKETING_URL = "http://localhost:3002";

if (branch === "master") {
    FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://app.ufincs.com";
    MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || "https://ufincs.com";
} else if (branch) {
    FRONTEND_URL = `https://${branch}.app.ufincs.com`;
    MARKETING_URL = `https://${branch}.ufincs.com`;
} else {
    IS_PRODUCTION = false;
}

export {FRONTEND_URL, MARKETING_URL, IS_MASTER, IS_PRODUCTION};
