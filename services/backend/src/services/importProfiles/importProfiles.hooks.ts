import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import dehydrate from "feathers-sequelize/hooks/dehydrate";
import hydrate from "feathers-sequelize/hooks/hydrate";
import {authenticate, findFromUser, includeUserId} from "hooks/";
import {ImportProfile} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const includeMappings = () => (context: HookContext) => {
    context.params.sequelize = {
        include: [{association: "importProfileMappings"}],
        raw: false
    };

    return context;
};

const removeUserIds = () => (context: HookContext) => {
    const {result} = context;

    const profilesWithoutUserIds = result.map((profile: ImportProfile) => {
        delete profile.userId;
        return profile;
    });

    context.result = profilesWithoutUserIds;
    return context;
};

const validateImportProfileData = () => (context: HookContext) => {
    const {data} = context;

    try {
        if (Array.isArray(data)) {
            data.forEach((profile) => {
                ImportProfile.validate(profile);
            });
        } else {
            ImportProfile.validate(data);
        }
    } catch (e) {
        throw new errors.BadRequest(e.message);
    }

    return context;
};

const createMappings = () => async (context: HookContext) => {
    const {importProfileMappings} = context.data;
    const importProfile = context.result;

    if (importProfileMappings) {
        for (const mappingData of importProfileMappings) {
            const mapping = await context.app.service("importProfileMappings").create(mappingData);
            await importProfile.addImportProfileMapping(mapping.id);
        }
    }
};

const updateMappings = () => async (context: HookContext) => {
    const {importProfileMappings} = context.data;

    if (importProfileMappings) {
        for (const mappingData of importProfileMappings) {
            await context.app.service("importProfileMappings").update(mappingData.id, mappingData);
        }
    }
};

export default {
    before: {
        all: [authenticate()],
        find: [iff(isProvider("external"), findFromUser()), includeMappings()],
        get: [disallow("external")],
        create: [includeUserId(), validateImportProfileData()],
        update: [includeUserId(), validateImportProfileData()],
        patch: [disallow("external")],
        remove: [disallow("external")]
    },

    after: {
        all: [],
        find: [dehydrate(), removeUserIds()],
        get: [],
        create: [hydrate(), createMappings(), dehydrate()],
        update: [hydrate(), updateMappings(), dehydrate()],
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
