import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import objectReduce from "utils/objectReduce";
import {Id, NonFunctionProperties, TableSortDirection} from "utils/types";
import ImportRuleAction, {ImportRuleActionData} from "./ImportRuleAction";
import ImportRuleCondition, {ImportRuleConditionData} from "./ImportRuleCondition";

export type ImportRuleSortOption = "date" | "rule";

export interface ImportRuleData
    extends Omit<NonFunctionProperties<ImportRule>, "importRuleActions" | "importRuleConditions"> {
    importRuleActions?: Array<ImportRuleAction>;
    importRuleConditions?: Array<ImportRuleCondition>;
}

interface ImportRuleConstructor extends Omit<ImportRule, "createdAt" | "updatedAt"> {
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default class ImportRule {
    id: Id;
    importRuleActionIds: Array<string>;
    importRuleConditionIds: Array<string>;
    createdAt: string;
    updatedAt: string;

    // Properties derived from store.
    importRuleActions: Array<ImportRuleAction>;
    importRuleConditions: Array<ImportRuleCondition>;

    static SORT_DEFAULT_DIRECTION = {
        date: "desc",
        rule: "asc"
    } as const;

    static SORT_MAP = {
        date: ImportRule.dateSortAsc,
        rule: ImportRule.rankSortAsc
    } as const;

    constructor({
        id = uuidv4(),
        importRuleActionIds = [],
        importRuleConditionIds = [],
        importRuleActions = [],
        importRuleConditions = [],
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<ImportRuleConstructor> = {}) {
        this.id = id;
        this.importRuleActionIds = importRuleActionIds;
        this.importRuleConditionIds = importRuleConditionIds;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);

        // Aggregate properties
        this.importRuleActions = importRuleActions;
        this.importRuleConditions = importRuleConditions;
    }

    mergeWithProperties(
        actionsById: Record<Id, ImportRuleAction>,
        conditionsById: Record<Id, ImportRuleCondition>
    ): void {
        this.importRuleActions = ImportRule._mergeWithActions(
            this.importRuleActionIds,
            actionsById
        );

        this.importRuleConditions = ImportRule._mergeWithConditions(
            this.importRuleConditionIds,
            conditionsById
        );
    }

    /** Validates that the rule is valid.
     *
     *  `ignoreDerivedProperties` is used by the BackupService so that it can validate rules
     *  as if they were the unpopulated versions. This option should not be enabled in
     *  normal operation, since we need to validate the actions/conditions normally. */
    validate({ignoreDerivedProperties = false} = {}): ImportRule {
        const {
            importRuleActions,
            importRuleActionIds,
            importRuleConditionIds,
            importRuleConditions
        } = this;

        if (
            !importRuleActionIds.length ||
            (!ignoreDerivedProperties && !importRuleActions.length)
        ) {
            throw new Error("No actions specified");
        }

        if (
            !importRuleConditionIds.length ||
            (!ignoreDerivedProperties && !importRuleConditions.length)
        ) {
            throw new Error("No conditions specified");
        }

        if (!ignoreDerivedProperties && anyDuplicateProperties(importRuleActions)) {
            throw new Error("Actions can't have duplicate properties");
        }

        if (!ignoreDerivedProperties && anyDuplicateProperties(importRuleConditions)) {
            throw new Error("Conditions can't have duplicate properties");
        }

        return this;
    }

    /** Creates a description of the rule that can be used for, e.g.,
     *  the toast announcing the rule's deletion. */
    static describeRule(rule: ImportRule): string {
        const firstCondition = rule.importRuleConditions?.[0];

        if (firstCondition) {
            // Use the rule's first condition's value as its primary 'description'.
            return `import rule for "${firstCondition.value}"`;
        } else {
            return `import rule "${rule.id}"`;
        }
    }

    static extractDataFields(
        object: any
    ): Omit<ImportRuleData, "importRuleActions" | "importRuleConditions"> {
        try {
            const {id, importRuleActionIds, importRuleConditionIds, createdAt, updatedAt} = object;

            return {id, importRuleActionIds, importRuleConditionIds, createdAt, updatedAt};
        } catch {
            throw new Error("Failed to extract data from import rule");
        }
    }

    /** Used to populate import rule data (from, e.g., a redux store) with action/condition data. */
    static populateImportRule(
        actionsById: Record<Id, ImportRuleActionData>,
        conditionsById: Record<Id, ImportRuleConditionData>
    ) {
        // Convert the data type into the model type here, rather than the underlying methods
        // in `mergeWithProperties`, since we need to call those underlying methods using
        // the data type in the `restoreEffectLogic` saga in `user.sagas` when restoring backups.
        // Which we have to do to get around not calling a model constructor during backup
        // so that we don't screw up any of the encrypted data.
        const populatedActions = objectReduce(actionsById, (x) => new ImportRuleAction(x));
        const populatedConditions = objectReduce(conditionsById, (x) => new ImportRuleCondition(x));

        return (ruleData: ImportRuleData) => {
            const rule = new ImportRule(ruleData);
            rule.mergeWithProperties(populatedActions, populatedConditions);

            return rule;
        };
    }

    /** Calculates the 'rank' of a rule by approximating the complexity of the rule
     *  based on the number conditions and how long the condition values are.
     *
     *  Additionally, regex conditions are considered inherently more complex than 'match' conditions. */
    static calculateRank(rule: ImportRule): number {
        const conditions = rule.importRuleConditions;

        // Calculate the complexity based on all of the conditions and the length of the values.
        // Each condition's complexity should be multiplied by 1.5 when its condition is a regex.
        // Why 1.5? Cause we want to weight it heavier, but 1.5 itself is arbitrary
        return conditions.reduce((acc, conditionData) => {
            const {condition, value} = conditionData;

            return (
                acc + value.length * (condition === ImportRuleCondition.CONDITION_MATCHES ? 1.5 : 1)
            );
        }, 0);
    }

    static dateSortAsc(a: ImportRuleData, b: ImportRuleData): number {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);

        if (!DateService.isValidDate(dateA)) {
            return -1;
        } else if (!DateService.isValidDate(dateB)) {
            return 1;
        }

        if (dateA > dateB) {
            return 1;
        } else if (dateA < dateB) {
            return -1;
        }

        return 0;
    }

    static rankSortAsc(a: ImportRule, b: ImportRule): number {
        const rankA = ImportRule.calculateRank(a);
        const rankB = ImportRule.calculateRank(b);

        return rankA - rankB;
    }

    /** The external interface for sorting import rules.
     *
     *  Note that it must be passed objects of type `ImportRule` and not `ImportRuleData`, since
     *  the rank sorting relies on the conditions being present. */
    static sort(
        rules: Array<ImportRule>,
        by: ImportRuleSortOption = "date",
        direction: TableSortDirection = "desc"
    ): Array<ImportRule> {
        const sortFunction = ImportRule.SORT_MAP[by];

        if (!sortFunction) {
            return rules;
        }

        const callback = (a: ImportRule, b: ImportRule) => {
            // Remember, the result of sortFunction is -1, 0, or 1.
            // Multiplying it by -1 when `desc` is true inverts the order,
            // whereas multiplying it by 1 when `desc` is false keeps the ascending order.
            return sortFunction(a, b) * (direction === "desc" ? -1 : 1);
        };

        // Create a copy of the array so that we get a new reference.
        // Needed for cache busting with things like useMemo.
        return [...rules].sort(callback);
    }

    /** Used during update processes to figure out which actions/conditions need to be
     *  created/updated/deleted.
     *
     *  Note: Although the array diffing algo includes `updated`, this is actually only for completeness.
     *  Because of how the `ImportRuleForm` edits rules (by always creating new IDs for actions/conditions),
     *  no actions/conditions will ever actually be marked as 'updated' (old ones will always just be
     *  deleted and replaced with new ones). But we'll keep that functionality around just in case. */
    static diffRules(
        oldRule: ImportRuleData,
        newRule: ImportRuleData
    ): {
        actions: {created: Array<Id>; updated: Array<Id>; deleted: Array<Id>};
        conditions: {created: Array<Id>; updated: Array<Id>; deleted: Array<Id>};
    } {
        return {
            actions: ImportRule._diffArrays(
                oldRule.importRuleActionIds,
                newRule.importRuleActionIds
            ),
            conditions: ImportRule._diffArrays(
                oldRule.importRuleConditionIds,
                newRule.importRuleConditionIds
            )
        };
    }

    static _mergeWithActions<T = ImportRuleAction>(ids: Array<Id>, actionsById: Record<Id, T>) {
        return ids.reduce<Array<T>>((acc, id: string) => {
            if (id in actionsById) {
                return [...acc, actionsById[id]];
            } else {
                return acc;
            }
        }, []);
    }

    static _mergeWithConditions<T = ImportRuleCondition>(
        ids: Array<Id>,
        conditionsById: Record<Id, T>
    ) {
        return ids.reduce<Array<T>>((acc, id: string) => {
            if (id in conditionsById) {
                return [...acc, conditionsById[id]];
            } else {
                return acc;
            }
        }, []);
    }

    static _diffArrays(
        oldArray: Array<string>,
        newArray: Array<string>
    ): {created: Array<string>; updated: Array<string>; deleted: Array<string>} {
        const oldIndex = oldArray.reduce<Record<string, string>>((acc, value) => {
            acc[value] = value;
            return acc;
        }, {});

        const newIndex = newArray.reduce<Record<string, string>>((acc, value) => {
            acc[value] = value;
            return acc;
        }, {});

        const result: {created: Array<string>; updated: Array<string>; deleted: Array<string>} = {
            created: [],
            updated: [],
            deleted: []
        };

        for (const oldValue of oldArray) {
            if (oldValue in newIndex) {
                result.updated.push(oldValue);
            } else if (!(oldValue in newIndex)) {
                result.deleted.push(oldValue);
            }
        }

        for (const newValue of newArray) {
            if (!(newValue in oldIndex)) {
                result.created.push(newValue);
            }
        }

        return result;
    }
}

const anyDuplicateProperties = (objects: Array<{property: string}>): boolean => {
    const values = objects.map(({property}) => property);
    return values.some((value, index) => values.indexOf(value) !== index);
};
