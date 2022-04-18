import {useCallback, useEffect} from "react";
import {useFieldArray, useForm} from "react-hook-form";
import {ImportRule, ImportRuleAction, ImportRuleCondition} from "models/";
import {
    ReactHookFormClearErrorFunction,
    ReactHookFormHandleSubmitFunction,
    ReactHookFormResetFunction,
    ReactHookFormSetErrorFunction,
    ReactHookFormSetValueFunction,
    ReactHookFormTriggerFunction
} from "utils/types";
import {defaultValues, ImportRuleFormData} from "values/importRuleForm";
import KeyCodes from "values/keyCodes";

const CUSTOM_SUBMISSION_ERROR = "submissionError";

/* Hooks */

const useAutofillWithEditingImportRule = (
    importRuleForEditing: ImportRule | undefined,
    setValue: ReactHookFormSetValueFunction
) => {
    useEffect(() => {
        if (importRuleForEditing) {
            setFormData(
                convertImportRuleToFormData(importRuleForEditing) as ImportRuleFormData,
                setValue
            );
        }
    }, [importRuleForEditing, setValue]);
};

const useSubmissionHandlers = (
    importRuleForEditing: ImportRule | undefined,
    errors: Record<string, any>,
    handleSubmit: ReactHookFormHandleSubmitFunction<ImportRuleFormData>,
    reset: ReactHookFormResetFunction<ImportRuleFormData>,
    setError: ReactHookFormSetErrorFunction,
    trigger: ReactHookFormTriggerFunction,
    onClose: () => void,
    onSubmit: (importRule: ImportRule) => void
) => {
    const finalOnSubmit = useCallback(
        (formData: ImportRuleFormData) => {
            if (!formData?.actions?.length) {
                throw new Error("Rules must have at least one action");
            } else if (!formData?.conditions?.length) {
                throw new Error("Rules must have at least one condition");
            }

            onSubmit(convertFormDataToImportRule(formData, importRuleForEditing));
        },
        [importRuleForEditing, onSubmit]
    );

    const formOnSubmit = handleSubmit((formData: ImportRuleFormData) => {
        try {
            finalOnSubmit(formData);
            onClose();
        } catch (e) {
            setError(CUSTOM_SUBMISSION_ERROR, {
                message: e.message,
                type: "manual"
            });
        }
    });

    const onMakeAnother = useCallback(async () => {
        // Need to manually validate because just calling handleSubmit doesn't have any way
        // of bailing us out of not resetting.
        const valid = await trigger();

        if (valid) {
            let hasError = false;

            await handleSubmit((formData: ImportRuleFormData) => {
                try {
                    finalOnSubmit(formData);
                } catch (e) {
                    setError(CUSTOM_SUBMISSION_ERROR, {
                        message: e.message,
                        type: "manual"
                    });

                    hasError = true;
                }
            })();

            // Need to manually check for the custom submission error, because `handleSubmit`
            // is only run before the error is set.
            //
            // That is, if the user were to click the "Make Another" button twice, without this extra
            // extra check, the form would be cleared.
            if (!hasError && !errors?.[CUSTOM_SUBMISSION_ERROR]?.message) {
                // Clear the form.
                reset(defaultValues);
            }
        }
    }, [errors, handleSubmit, reset, setError, trigger, finalOnSubmit]);

    const formOnKeyDown = useCallback(
        async (e: React.KeyboardEvent<HTMLFormElement>) => {
            if (e.ctrlKey && e.keyCode === KeyCodes.ENTER) {
                // Disable the default (submit) event when Ctrl is pressed and Enter is the key.
                //
                // This is a workaround for Cypress seemingly allowing a "Ctrl+Enter" sequence to
                // trigger the default "Enter" handler on the form (that is, Ctrl+Enter submits the
                // form normally under Cypress).
                e.preventDefault();
            }

            if (!importRuleForEditing && e.ctrlKey && e.keyCode === KeyCodes.ENTER) {
                await onMakeAnother();
            }
        },
        [importRuleForEditing, onMakeAnother]
    );

    return {formOnKeyDown, formOnSubmit, onMakeAnother};
};

/** Ensures that the custom submission error for action/condition lengths gets cleared
 *  once the user has added at least one action/condition.
 *
 *  We need to handle this clearing outside of `onSubmit`, because react-hook-form doesn't call
 *  `onSubmit` if any errors are set. */
const useClearFieldLengthsError = (
    actionsFields: Array<any>,
    conditionsFields: Array<any>,
    errors: Record<string, any>,
    clearErrors: ReactHookFormClearErrorFunction,
    setError: ReactHookFormSetErrorFunction
) => {
    // Need to reduce each value down to a primitive just to be extra sure that the deps
    // for useEffect are constant. Otherwise, it could result in an infinite loop.
    const actionsCount = actionsFields.length;
    const conditionsCount = conditionsFields.length;
    const submissionErrorMessage = errors?.[CUSTOM_SUBMISSION_ERROR]?.message;

    useEffect(() => {
        if (actionsCount && conditionsCount && submissionErrorMessage) {
            // Only clear the (custom) error if it exists and we actions + conditions.
            // Otherwise, possibility for infinite loop.
            clearErrors(CUSTOM_SUBMISSION_ERROR);
        }
    }, [actionsCount, conditionsCount, submissionErrorMessage, clearErrors, setError]);
};

/* Main Hook */

export const useImportRuleForm = (
    importRuleForEditing: ImportRule | undefined,
    onClose: () => void,
    onSubmit: (importRule: ImportRule) => void
) => {
    const formMethods = useForm<ImportRuleFormData>({
        defaultValues: importRuleForEditing
            ? convertImportRuleToFormData(importRuleForEditing)
            : defaultValues
    });

    const {
        control,
        errors,
        clearErrors,
        getValues,
        handleSubmit,
        reset,
        setError,
        setValue,
        trigger
    } = formMethods;

    const actionsField = useFieldArray<ImportRuleAction>({control: control, name: "actions"});

    const conditionsField = useFieldArray<ImportRuleCondition>({
        control: control,
        name: "conditions"
    });

    const onAddAction = useCallback(() => {
        const unusedActionProperties = getUnusedProperties(
            // Need to use getValues rather than directly accessing `actionsField` because when
            // a user changes the property input value, it doesn't cause a re-render (as it should),
            // but that means that the `actionsField` values are stale. As such, use getValues
            // to get the most up-to-date values.
            //
            // Additionally, have to access `.actions` rather than calling `getValues("actions")`
            // because... it just doesn't work otherwise. IDK. Probably cause it's an array field.
            //
            // Also, need to default to an empty array cause, when there are no actions, react-hook-form,
            // for some stupid reason, sets empty array fields to _undefined_ rather than an empty array.
            getValues().actions || [],
            ImportRuleAction.PROPERTIES
        );

        if (unusedActionProperties.length > 0) {
            actionsField.append({
                property: unusedActionProperties[0],
                value: ""
            });
        }
    }, [actionsField, getValues]);

    const onAddCondition = useCallback(() => {
        const unusedConditionProperties = getUnusedProperties(
            // See `onAddAction` for why to use getValues rather than `conditionsField`.
            getValues().conditions || [],
            ImportRuleCondition.PROPERTIES
        );

        if (unusedConditionProperties.length > 0) {
            conditionsField.append({
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                property: unusedConditionProperties[0],
                value: ""
            });
        }
    }, [conditionsField, getValues]);

    // At one point, the disabled state of the add buttons was derived from the list of unused
    // properties, but I realized that this was wrong because the user could manually change
    // action/conditions to have duplicate properties.
    //
    // As such, the more correct way to disable the add button is based on the total number
    // of actions/conditions, regardless of what properties they are currently set to.
    const addActionDisabled = actionsField.fields.length === ImportRuleAction.PROPERTIES.length;

    const addConditionDisabled =
        conditionsField.fields.length === ImportRuleCondition.PROPERTIES.length;

    const submissionError = getSubmissionError(errors);

    const {formOnKeyDown, formOnSubmit, onMakeAnother} = useSubmissionHandlers(
        importRuleForEditing,
        errors,
        handleSubmit,
        reset,
        setError,
        trigger,
        onClose,
        onSubmit
    );

    useClearFieldLengthsError(
        actionsField.fields,
        conditionsField.fields,
        errors,
        clearErrors,
        setError
    );

    useAutofillWithEditingImportRule(importRuleForEditing, setValue);

    return {
        actionsField,
        addActionDisabled,
        addConditionDisabled,
        conditionsField,
        formMethods,
        submissionError,
        onAddAction,
        onAddCondition,
        formOnKeyDown,
        formOnSubmit,
        onMakeAnother
    };
};

/* Helper Functions */

const convertFormDataToImportRule = (
    formData: ImportRuleFormData,
    importRuleForEditing: ImportRule | undefined = undefined
) => {
    const importRule = importRuleForEditing
        ? new ImportRule({id: importRuleForEditing.id, createdAt: importRuleForEditing.createdAt})
        : new ImportRule();

    const actions = formData.actions.map(
        (action) => new ImportRuleAction({...action, importRuleId: importRule.id})
    );

    const conditions = formData.conditions.map(
        (condition) => new ImportRuleCondition({...condition, importRuleId: importRule.id})
    );

    importRule.importRuleActionIds = actions.map(({id}) => id);
    importRule.importRuleConditionIds = conditions.map(({id}) => id);

    importRule.importRuleActions = actions;
    importRule.importRuleConditions = conditions;

    return importRule;
};

const convertImportRuleToFormData = (importRule: ImportRule | undefined | null) => {
    if (!importRule) {
        return {};
    }

    // Sort the actions/conditions so that, when a user starts editing a rule, their aren't in whatever
    // random order they were in when first creating the rule. AKA, sorting is more aesthetic.
    const actions = ImportRuleAction.sortByProperty(importRule.importRuleActions);
    const conditions = ImportRuleCondition.sortByProperty(importRule.importRuleConditions);

    return {actions, conditions};
};

const setFormData = (newFormData: ImportRuleFormData, setValue: ReactHookFormSetValueFunction) => {
    const {actions, conditions} = newFormData;

    setValue("actions", actions);
    setValue("conditions", conditions);
};

const getUnusedProperties = <T>(
    objectsWithProperties: Array<{property?: T}>,
    propertiesList: Array<T>
): Array<T> => {
    const existingProperties = objectsWithProperties.map(({property}) => property);

    const unusedProperties = propertiesList.filter(
        (property) => !existingProperties.includes(property)
    );

    return unusedProperties;
};

const getSubmissionError = (rawErrors: Record<string, any>) => {
    let errors: Array<string> = [];

    for (const action of rawErrors?.actions || []) {
        if (action) {
            errors = [...errors, ...Object.keys(action).map((key) => action[key].message)];
        }
    }

    for (const condition of rawErrors?.conditions || []) {
        if (condition) {
            errors = [...errors, ...Object.keys(condition).map((key) => condition[key].message)];
        }
    }

    // Include any of our custom submission errors.
    if (rawErrors?.[CUSTOM_SUBMISSION_ERROR]) {
        errors.push(rawErrors?.[CUSTOM_SUBMISSION_ERROR]?.message);
    }

    // De-duplicate the errors. This is specifically to handle the case where the user uses a property
    // more than once. Since the property will be used in multiple inputs, then all of those inputs
    // will throw the same error message. And since `SelectInput`s don't have an error message field
    // of their own, we want to display the 'duplicate property' error message as a submission error.
    //
    // Note that this also works fine with regular errors (e.g. for the Value input), since the user
    // will just be shown the same error message that is shown above those inputs.
    errors = Array.from(new Set(errors));

    if (errors.length > 1) {
        return "Looks like you're missing some things";
    } else {
        return errors[0];
    }
};
