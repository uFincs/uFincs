import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import {Id, NonFunctionProperties} from "utils/types";

export type ImportRuleActionProperty = "account" | "description" | "type" | "";

export interface ImportRuleActionData extends NonFunctionProperties<ImportRuleAction> {}

export default class ImportRuleAction {
    id: Id;
    importRuleId: string;

    property: ImportRuleActionProperty;
    value: string;

    createdAt: Date | string;
    updatedAt: Date | string;

    static PROPERTY_ACCOUNT: ImportRuleActionProperty = "account";
    static PROPERTY_DESCRIPTION: ImportRuleActionProperty = "description";
    static PROPERTY_TYPE: ImportRuleActionProperty = "type";

    static PROPERTIES: ImportRuleActionProperty[] = ["account", "description", "type"];

    constructor({
        id = uuidv4(),
        importRuleId = "",
        property = "",
        value = "",
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<ImportRuleAction> = {}) {
        this.id = id;
        this.importRuleId = importRuleId;

        this.property = property;
        this.value = value;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);
    }

    validate(): ImportRuleAction {
        const {importRuleId, property, value} = this;

        if (!importRuleId) {
            throw new Error("Action doesn't have an associated import rule");
        }

        if (!property) {
            throw new Error("Action is missing a property");
        }

        if (!ImportRuleAction.PROPERTIES.includes(property)) {
            throw new Error("Action has an invalid property");
        }

        if (!value) {
            throw new Error("Action is missing a value");
        }

        return this;
    }

    static extractDataFields(object: any): ImportRuleActionData {
        try {
            const {id, importRuleId, property, value, createdAt, updatedAt} = object;

            return {id, importRuleId, property, value, createdAt, updatedAt};
        } catch {
            throw new Error("Failed to extract data from import rule action");
        }
    }

    static formatProperty(property: ImportRuleActionProperty) {
        switch (property) {
            case "account":
                return "Account";
            case "description":
                return "Description";
            case "type":
                return "Type";
        }
    }

    static sortByProperty(actions: Array<ImportRuleActionData>) {
        return actions.sort((a, b) => a.property.localeCompare(b.property));
    }

    /** "Apply order" is just the order in which actions should be applied when transforming
     *  a transaction. Currently, this really only requires that 'type' actions apply before
     *  'account' actions, since which side the account action applies to is derived from the type.
     *  The rest of the order doesn't matter.  */
    static sortByApplyOrder(actions: Array<ImportRuleActionData>) {
        return actions.sort((a, b) => {
            if (a.property === "type") {
                return -1;
            } else if (b.property === "type") {
                return 1;
            } else {
                return 0;
            }
        });
    }
}
