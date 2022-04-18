import {disallow} from "feathers-hooks-common";
// Don't remove this comment. It's needed to format import lines nicely.

export default {
    before: {
        // This service is only for use on the backend; everything related to mappings should
        // go through the `importProfiles` service from the perspective of the client.
        // As such, so that we don't have to secure this service in any way, we just
        // prevent it from being called client-side.
        all: [disallow("external")],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
