import {ImportRuleAction, ImportRuleCondition} from "models/";
import {ImportRuleFormData, ReactHookFormGetValueFunction} from "utils/types";
import InputValidation from "values/inputValidation";

export type {ImportRuleFormData};

export const defaultValues: ImportRuleFormData = {
    // Note: Although Description is not the first property in the list (Account is), I've decided
    // it should be the default property (for both actions and conditions) for two reasons:
    //
    // 1. It is likely that it will be the more commonly used property.
    // 2. There is an annoying bug with using the Account property as the default for the action
    //    where, since the value is blank by default, the `SelectInput` will also be blank even
    //    though a valid `defaultValue` has been given to it. Yet this behaviour doesn't show up
    //    when creating other actions with the Account property — it's literally only the first one.
    //
    // I think the bug in 2. could be fixed by passing in the accounts to the ImportRuleForm
    // so that they can get here and we can assign an actual default account value, but that's
    // much more work than just changing the default to Description.
    actions: [new ImportRuleAction({property: ImportRuleAction.PROPERTY_DESCRIPTION})],
    conditions: [
        new ImportRuleCondition({
            condition: ImportRuleCondition.CONDITION_CONTAINS,
            property: ImportRuleCondition.PROPERTY_DESCRIPTION
        })
    ]
};

export const inputRules = {
    actions: {
        property: (getValues: ReactHookFormGetValueFunction) => ({
            required: "Property is required",
            validate: {
                // Tech Debt: There's a bug with this. When a user tries to validate the form
                // with duplicate properties, the duplicate properties will be highlighted.
                //
                // However, if the user changes one of the properties (so that there are no longer
                // any duplicates), the input that wasn't changed will still be marked with an
                // error. The user has to click into the input, change the value, then change
                // the value back to get the validation logic to re-run properly.
                //
                // I can only assume this is a bug with `react-hook-form`, since our code is sound.
                //
                // But since this is an edge case scenario (and users are likely to be able to
                // figure it out on their own), we shall leave it as tech debt.
                noDuplicates: () => {
                    // For some reason, using `getValues("actions")` just returns undefined,
                    // whereas accessing the full state works fine.
                    //
                    // Also, need to default to an empty array cause, when there are no actions,
                    // react-hook-form, for some stupid reason, sets empty array fields to
                    // _undefined_ rather than an empty array.
                    const actions = (getValues() as ImportRuleFormData).actions || [];
                    const properties = actions.map(({property}) => property);

                    return (
                        new Set(properties).size === properties.length ||
                        "Actions can't have duplicate properties"
                    );
                }
            }
        }),
        value: {
            required: "Value is required",
            maxLength: {
                value: InputValidation.maxDescriptionLength,
                message: `Value is longer than ${InputValidation.maxDescriptionLength} characters`
            }
        }
    },
    conditions: {
        condition: {
            required: "Condition is required"
        },
        property: (getValues: ReactHookFormGetValueFunction) => ({
            required: "Property is required",
            validate: {
                // Tech Debt: There's a bug with this. When a user tries to validate the form
                // with duplicate properties, the duplicate properties will be highlighted.
                //
                // However, if the user changes one of the properties (so that there are no longer
                // any duplicates), the input that wasn't changed will still be marked with an
                // error. The user has to click into the input, change the value, then change
                // the value back to get the validation logic to re-run properly.
                //
                // I can only assume this is a bug with `react-hook-form`, since our code is sound.
                //
                // But since this is an edge case scenario (and users are likely to be able to
                // figure it out on their own), we shall leave it as tech debt.
                noDuplicates: () => {
                    // For some reason, using `getValues("conditions")` just returns undefined,
                    // whereas accessing the full state works fine.
                    //
                    // Also, need to default to an empty array cause, when there are no actions,
                    // react-hook-form, for some stupid reason, sets empty array fields to
                    // _undefined_ rather than an empty array.
                    const conditions = (getValues() as ImportRuleFormData).conditions || [];
                    const properties = conditions.map(({property}) => property);

                    return (
                        new Set(properties).size === properties.length ||
                        "Conditions can't have duplicate properties"
                    );
                }
            }
        }),
        value: {
            required: "Value is required",
            maxLength: {
                value: InputValidation.maxDescriptionLength,
                message: `Value is longer than ${InputValidation.maxDescriptionLength} characters`
            }
        }
    }
};
