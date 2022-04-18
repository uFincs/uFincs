import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import dehydrate from "feathers-sequelize/hooks/dehydrate";
import hydrate from "feathers-sequelize/hooks/hydrate";
import {authenticate, findFromUser, includeUserId} from "hooks/";
import {ImportRule, ImportRuleAction, ImportRuleCondition} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const includeAssociations = () => (context: HookContext) => {
    context.params.sequelize = {
        include: [{association: "importRuleActions"}, {association: "importRuleConditions"}],
        raw: false
    };

    return context;
};

const removeUserIds = () => (context: HookContext) => {
    const {result} = context;

    const rulesWithoutUserIds = result.map((rule: ImportRule) => {
        delete rule.userId;
        return rule;
    });

    context.result = rulesWithoutUserIds;
    return context;
};

const createActions = () => async (context: HookContext) => {
    // Need to support the array case for restoring backups.
    const rawImportRules: Array<ImportRule> = Array.isArray(context.data)
        ? context.data
        : [context.data];

    const populatedImportRules = Array.isArray(context.result) ? context.result : [context.result];

    for (let i = 0; i < rawImportRules.length; i++) {
        const {importRuleActions} = rawImportRules[i];
        const importRule = populatedImportRules[i];

        if (importRuleActions) {
            for (const actionData of importRuleActions) {
                const action = await context.app.service("importRuleActions").create(actionData);
                await importRule.addImportRuleAction(action.id);
            }
        }
    }
};

const createConditions = () => async (context: HookContext) => {
    // Need to support the array case for restoring backups.
    const rawImportRules: Array<ImportRule> = Array.isArray(context.data)
        ? context.data
        : [context.data];

    const populatedImportRules = Array.isArray(context.result) ? context.result : [context.result];

    for (let i = 0; i < rawImportRules.length; i++) {
        const {importRuleConditions} = rawImportRules[i];
        const importRule = populatedImportRules[i];

        if (importRuleConditions) {
            for (const conditionData of importRuleConditions) {
                const condition = await context.app
                    .service("importRuleConditions")
                    .create(conditionData);

                await importRule.addImportRuleCondition(condition.id);
            }
        }
    }
};

const updateAssociations = () => async (context: HookContext) => {
    const rule: ImportRule = context.data;
    const {id, importRuleActions, importRuleConditions} = rule;

    const oldRule = await context.app.service("importRules").get(id);
    const ruleDiff = ImportRule.diffRules(oldRule, rule);

    const newActions = importRuleActions.reduce<Record<string, ImportRuleAction>>((acc, action) => {
        acc[action.id] = action;
        return acc;
    }, {});

    const newConditions = importRuleConditions.reduce<Record<string, ImportRuleCondition>>(
        (acc, condition) => {
            acc[condition.id] = condition;
            return acc;
        },
        {}
    );

    for (const id of ruleDiff.actions.created) {
        await context.app.service("importRuleActions").create(newActions[id]);
    }

    for (const id of ruleDiff.actions.updated) {
        await context.app.service("importRuleActions").update(id, newActions[id]);
    }

    for (const id of ruleDiff.actions.deleted) {
        await context.app.service("importRuleActions").remove(id);
    }

    for (const id of ruleDiff.conditions.created) {
        await context.app.service("importRuleConditions").create(newConditions[id]);
    }

    for (const id of ruleDiff.conditions.updated) {
        await context.app.service("importRuleConditions").update(id, newConditions[id]);
    }

    for (const id of ruleDiff.conditions.deleted) {
        await context.app.service("importRuleConditions").remove(id);
    }
};

const deleteAssociations = () => async (context: HookContext) => {
    const id = context.id;
    let rules: Array<ImportRule> = [];

    if (context.method === "remove" && id === null && context.params.query) {
        // This handles the case for multi `remove`.

        // The ID query comes in as an object representation of an array
        // (so, an object with indices as keys mapping to IDs).
        // However, it doesn't seem to work when passing the object representation
        // as a query, so we have to convert it back to just an array.
        //
        // This is true for both the query to look up the transactions and the underlying
        // remove method.
        //
        // Don't know why it does this...
        const ids = Object.values(context.params.query?.id?.["$in"]);

        rules = await context.app.service("importRules").find({
            query: {
                id: {
                    $in: ids
                }
            }
        });

        if (!rules.length) {
            return context;
        }

        context.params.query.id["$in"] = ids;
    } else {
        const rule: ImportRule = await context.app.service("importRules").get(id);

        if (!rule) {
            return context;
        }

        rules = [rule];
    }

    const actionIds: Array<string> = [];
    const conditionIds: Array<string> = [];

    for (const rule of rules) {
        actionIds.push(...rule.importRuleActions.map(({id}) => id));
        conditionIds.push(...rule.importRuleConditions.map(({id}) => id));
    }

    await context.app.service("importRuleActions").remove(actionIds);
    await context.app.service("importRuleConditions").remove(conditionIds);
};

export default {
    before: {
        all: [authenticate()],
        find: [iff(isProvider("external"), findFromUser()), includeAssociations()],
        get: [disallow("external"), includeAssociations()],
        create: [includeUserId()],
        update: [includeUserId()],
        patch: [disallow("external")],
        remove: [deleteAssociations()]
    },

    after: {
        all: [],
        find: [dehydrate(), removeUserIds()],
        get: [],
        create: [hydrate(), createActions(), createConditions(), dehydrate()],
        update: [hydrate(), updateAssociations(), dehydrate()],
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
