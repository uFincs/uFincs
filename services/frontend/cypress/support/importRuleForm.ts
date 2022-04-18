import {ImportRuleFormData} from "../../src/utils/types";

const selectors = {
    form: {
        ruleForm: "[data-testid=import-rule-form]",
        ruleFormCloseButton: "[data-testid=import-rule-form-close-button]",
        actionsContainer: "[data-testid=import-rule-form-actions]",
        conditionsContainer: "[data-testid=import-rule-form-conditions]",
        actionCard: "[data-testid=rule-action-card]",
        conditionCard: "[data-testid=rule-condition-card]",
        actionDeleteButton: "[data-testid=form-card-container-close-button]",
        conditionDeleteButton: "[data-testid=form-card-container-close-button]",
        inputActionProperty: (index: number) => `select[name="actions[${index}].property"]`,
        inputActionValue: (index: number, property: string) => {
            return `${
                property === "description" ? "input" : "select"
            }[name="actions[${index}].value"]`;
        },
        inputConditionCondition: (index: number) => `select[name="conditions[${index}].condition"]`,
        inputConditionProperty: (index: number) => `select[name="conditions[${index}].property"]`,
        inputConditionValue: (index: number) => `input[name="conditions[${index}].value"]`
    }
};

export const ImportRuleForm = {
    form() {
        return cy.get(selectors.form.ruleForm);
    },
    actions() {
        return this.form().find(selectors.form.actionsContainer);
    },
    conditions() {
        return this.form().find(selectors.form.conditionsContainer);
    },
    shouldHaveNumberOfActions(number: number) {
        return this.actions()
            .find(selectors.form.actionCard)
            .its("length")
            .then((length) => length === number);
    },
    shouldHaveNumberOfConditions(number: number) {
        return this.conditions()
            .find(selectors.form.conditionCard)
            .its("length")
            .then((length) => length === number);
    },
    formInput(selector: string) {
        return this.form().find(selector);
    },
    actionPropertyInput(index: number = 0) {
        return this.formInput(selectors.form.inputActionProperty(index));
    },
    actionValueInput(index: number = 0, property: string) {
        return this.formInput(selectors.form.inputActionValue(index, property));
    },
    conditionConditionInput(index: number = 0) {
        return this.formInput(selectors.form.inputConditionCondition(index));
    },
    conditionPropertyInput(index: number = 0) {
        return this.formInput(selectors.form.inputConditionProperty(index));
    },
    conditionValueInput(index: number = 0) {
        return this.formInput(selectors.form.inputConditionValue(index));
    },
    closeForm() {
        this.form().find(selectors.form.ruleFormCloseButton).click();
    },
    addAction() {
        cy.contains("Add Action").click({force: true});
    },
    addCondition() {
        cy.contains("Add Condition").click({force: true});
    },
    deleteAction(index: number = 0) {
        this.actions().find(selectors.form.actionDeleteButton).eq(index).click();
    },
    deleteCondition(index: number = 0) {
        this.conditions().find(selectors.form.actionDeleteButton).eq(index).click();
    },
    enterActionData(action: {property: string; value: string}, index: number = 0) {
        this.actionPropertyInput(index).select(action.property);

        if (action.property === "description") {
            this.actionValueInput(index, action.property).clear().type(action.value);
        } else {
            this.actionValueInput(index, action.property).select(action.value);
        }
    },
    enterConditionData(
        condition: {condition: string; property: string; value: string},
        index: number = 0
    ) {
        this.conditionConditionInput(index).select(condition.condition);
        this.conditionPropertyInput(index).select(condition.property);
        this.conditionValueInput(index).clear().type(condition.value);
    },
    enterFormData(data: ImportRuleFormData) {
        const {actions, conditions} = data;

        actions.forEach((action, index) => {
            this.form().then((form) => {
                // Need to make sure the action of the given index exists before setting its data.
                //
                // For reference, this style of checking for selector length 'synchronously' is
                // documented here:
                // https://docs.cypress.io/guides/core-concepts/conditional-testing#Element-existence
                if (!form.find(selectors.form.inputActionProperty(index)).length) {
                    this.addAction();
                }

                this.enterActionData(action, index);
            });
        });

        conditions.forEach((condition, index) => {
            this.form().then((form) => {
                if (!form.find(selectors.form.inputConditionCondition(index)).length) {
                    this.addCondition();
                }

                this.enterConditionData(condition, index);
            });
        });
    },
    createRule() {
        this.form().contains("Add Import Rule").click();
    },
    createAndMakeAnother() {
        this.form().contains("Add & Make Another").click();
    },
    updateRule() {
        this.form().contains("Update Import Rule").click();
    }
};
