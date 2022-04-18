import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import {Id, NonFunctionProperties} from "utils/types";

// Yes, this is an unfortunate name... you got a better suggestion?
export type ImportRuleConditionCondition = "contains" | "matches" | "";

export type ImportRuleConditionProperty = "account" | "description" | "";

export interface ImportRuleConditionData extends NonFunctionProperties<ImportRuleCondition> {}

export default class ImportRuleCondition {
    id: Id;
    importRuleId: string;

    condition: ImportRuleConditionCondition;
    property: ImportRuleConditionProperty;
    value: string;

    createdAt: Date | string;
    updatedAt: Date | string;

    static CONDITION_CONTAINS: ImportRuleConditionCondition = "contains";
    static CONDITION_MATCHES: ImportRuleConditionCondition = "matches";

    static PROPERTY_ACCOUNT: ImportRuleConditionProperty = "account";
    static PROPERTY_DESCRIPTION: ImportRuleConditionProperty = "description";

    static CONDITIONS: ImportRuleConditionCondition[] = ["contains", "matches"];
    static PROPERTIES: ImportRuleConditionProperty[] = ["account", "description"];

    constructor({
        id = uuidv4(),
        importRuleId = "",
        condition = "",
        property = "",
        value = "",
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<ImportRuleCondition> = {}) {
        this.id = id;
        this.importRuleId = importRuleId;

        this.condition = condition;
        this.property = property;
        this.value = value;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);
    }

    validate(): ImportRuleCondition {
        const {importRuleId, condition, property, value} = this;

        if (!importRuleId) {
            throw new Error("Condition doesn't have an associated import rule");
        }

        if (!condition) {
            throw new Error("Condition is missing its condition");
        }

        if (!ImportRuleCondition.PROPERTIES.includes(property)) {
            throw new Error("Condition has an invalid property");
        }

        if (!property) {
            throw new Error("Condition is missing a property");
        }

        if (!ImportRuleCondition.PROPERTIES.includes(property)) {
            throw new Error("Condition has an invalid property");
        }

        if (!value) {
            throw new Error("Condition is missing a value");
        }

        return this;
    }

    static extractDataFields(object: any): ImportRuleConditionData {
        try {
            const {id, importRuleId, condition, property, value, createdAt, updatedAt} = object;

            return {id, importRuleId, condition, property, value, createdAt, updatedAt};
        } catch {
            throw new Error("Failed to extract data from import rule condition");
        }
    }

    static formatCondition(condition: ImportRuleConditionCondition) {
        switch (condition) {
            case "contains":
                return "contains";
            case "matches":
                return "matches regex";
        }
    }

    static formatProperty(property: ImportRuleConditionProperty) {
        switch (property) {
            case "account":
                return "Account";
            case "description":
                return "Description";
        }
    }

    static sortByProperty(conditions: Array<ImportRuleConditionData>) {
        return conditions.sort((a, b) => a.property.localeCompare(b.property));
    }
}
