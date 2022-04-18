import {
    Account,
    ImportableTransaction,
    ImportRule,
    ImportRuleAction,
    ImportRuleCondition,
    Transaction
} from "models/";
import ImportRulesApplier from "./ImportRulesApplier";

const defaultValue = "value";

const assetAccount = new Account({type: Account.ASSET});
const expenseAccount = new Account({type: Account.EXPENSE});

const accountsById = {
    [assetAccount.id]: assetAccount,
    [expenseAccount.id]: expenseAccount
};

const createRule = ({
    condition = ImportRuleCondition.CONDITION_CONTAINS,
    conditionProperty = ImportRuleCondition.PROPERTY_DESCRIPTION,
    conditionValue = defaultValue,
    actionProperty = ImportRuleAction.PROPERTY_DESCRIPTION,
    actionValue = defaultValue
}: any = {}) => {
    const ruleCondition = new ImportRuleCondition({
        condition,
        property: conditionProperty,
        value: conditionValue
    });

    const ruleAction = new ImportRuleAction({
        property: actionProperty,
        value: actionValue
    });

    const rule = new ImportRule({
        importRuleActions: [ruleAction],
        importRuleConditions: [ruleCondition]
    });

    return rule;
};

const createTransaction = ({
    conditionProperty = ImportRuleCondition.PROPERTY_DESCRIPTION,
    transactionType = Transaction.INCOME,
    transactionValue = defaultValue
}: any = {}) => {
    const inputTransaction = new ImportableTransaction({type: transactionType});

    if (conditionProperty === ImportRuleCondition.PROPERTY_ACCOUNT) {
        inputTransaction.targetAccount = transactionValue;
    } else if (conditionProperty === ImportRuleCondition.PROPERTY_DESCRIPTION) {
        inputTransaction.description = transactionValue;
    }

    return inputTransaction;
};

const applySingleRule = (
    rule: ImportRule,
    inputTransaction: ImportableTransaction,
    {ruleShouldBeActive = true} = {}
) => {
    const {activeRuleIds, transactions} = ImportRulesApplier.applyRules(
        [rule],
        [inputTransaction],
        accountsById
    );

    if (ruleShouldBeActive) {
        expect(activeRuleIds).toContain(rule.id);
    } else {
        expect(activeRuleIds).not.toContain(rule.id);
    }

    return {outputTransaction: transactions[inputTransaction.id]};
};

describe("applyRules", () => {
    describe("All combinations of one condition and one action", () => {
        const conditionValuePairs = [
            {
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                conditionValue: "value",
                transactionValue: "value",
                valid: true
            },
            {
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                conditionValue: "value",
                transactionValue: "not",
                valid: false
            },
            {
                condition: ImportRuleCondition.CONDITION_MATCHES,
                conditionValue: "value|other",
                transactionValue: "other",
                valid: true
            },
            {
                condition: ImportRuleCondition.CONDITION_MATCHES,
                conditionValue: "value|other",
                transactionValue: "not",
                valid: false
            }
        ];

        const actionValuePairs = [
            {
                account: expenseAccount.id,
                transactionProperty: "debitAccountId",
                // Here, transactionType is the starting type.
                // It must be expense here so that the account ID gets put on the right side.
                transactionType: Transaction.EXPENSE
            },
            {
                description: "new value",
                transactionProperty: ImportRuleCondition.PROPERTY_DESCRIPTION,
                transactionType: Transaction.INCOME
            },
            {
                type: Transaction.EXPENSE,
                transactionProperty: "type",
                transactionType: Transaction.INCOME
            }
        ];

        const testInputs = [];

        // Create every possible combination of one condition and one action that creates
        // a valid (active) rule.
        for (const condition of ImportRuleCondition.CONDITIONS) {
            for (const conditionProperty of ImportRuleCondition.PROPERTIES) {
                for (const actionProperty of ImportRuleAction.PROPERTIES) {
                    for (const conditionValuePair of conditionValuePairs) {
                        for (const actionValuePair of actionValuePairs) {
                            if (
                                // @ts-ignore Allow indexing.
                                actionValuePair[actionProperty] &&
                                // @ts-ignore Allow indexing.
                                conditionValuePair.condition === condition
                            ) {
                                const testInput = {
                                    condition,
                                    conditionProperty,
                                    // @ts-ignore Allow indexing.
                                    conditionValue: conditionValuePair.conditionValue,
                                    conditionMatches: conditionValuePair.valid,
                                    actionProperty,
                                    // @ts-ignore Allow indexing.
                                    actionValue: actionValuePair[actionProperty],
                                    transactionProperty: actionValuePair.transactionProperty,
                                    transactionType: actionValuePair.transactionType,
                                    transactionValue: conditionValuePair.transactionValue
                                };

                                testInputs.push(testInput);
                            }
                        }
                    }
                }
            }
        }

        // This tests that every combination of 1 condition and 1 action works.
        it.each(testInputs)(
            "can apply a rule with %j inputs",
            ({
                condition,
                conditionProperty,
                conditionValue,
                conditionMatches,
                actionProperty,
                actionValue,
                transactionProperty,
                transactionType,
                transactionValue
            }) => {
                const rule = createRule({
                    condition,
                    conditionProperty,
                    conditionValue,
                    actionProperty,
                    actionValue
                });

                const inputTransaction = createTransaction({
                    conditionProperty,
                    transactionType,
                    transactionValue
                });

                const {outputTransaction} = applySingleRule(rule, inputTransaction, {
                    ruleShouldBeActive: conditionMatches
                });

                if (conditionMatches) {
                    // @ts-ignore Allow indexing.
                    expect(outputTransaction[transactionProperty]).toBe(actionValue);
                } else {
                    // @ts-ignore Allow indexing.
                    expect(outputTransaction[transactionProperty]).toBe(
                        // @ts-ignore Allow indexing.
                        inputTransaction[transactionProperty]
                    );
                }
            }
        );
    });

    describe("Other Cases", () => {
        describe("Case Sensitivity", () => {
            const validConditionPairs = [
                {
                    condition: ImportRuleCondition.CONDITION_CONTAINS,
                    conditionValue: "value",
                    transactionValue: "Value"
                },
                {
                    condition: ImportRuleCondition.CONDITION_CONTAINS,
                    conditionValue: "Value",
                    transactionValue: "value"
                },
                {
                    condition: ImportRuleCondition.CONDITION_MATCHES,
                    conditionValue: "value|other",
                    transactionValue: "Other"
                },
                {
                    condition: ImportRuleCondition.CONDITION_MATCHES,
                    conditionValue: "value|OTHER",
                    transactionValue: "other"
                }
            ];

            it.each(validConditionPairs)(
                "is case-insensitive %j",
                ({condition, conditionValue, transactionValue}) => {
                    const rule = createRule({condition, conditionValue});

                    const inputTransaction = createTransaction({
                        conditionProperty: ImportRuleCondition.PROPERTY_DESCRIPTION,
                        transactionType: Transaction.INCOME,
                        transactionValue
                    });

                    const {outputTransaction} = applySingleRule(rule, inputTransaction);

                    expect(outputTransaction.description).toBe(defaultValue);
                }
            );
        });

        it("works with multiple transactions", () => {
            const rule = createRule();

            const transaction1 = createTransaction();
            const transaction2 = createTransaction();

            const {activeRuleIds, transactions} = ImportRulesApplier.applyRules(
                [rule],
                [transaction1, transaction2],
                accountsById
            );

            expect(activeRuleIds).toContain(rule.id);

            for (const outputTransaction of Object.values(transactions)) {
                expect(outputTransaction.description).toBe(defaultValue);
            }
        });

        it("won't apply account actions if they aren't valid", () => {
            const rule = createRule({
                actionProperty: ImportRuleAction.PROPERTY_ACCOUNT,
                actionValue: expenseAccount.id
            });

            // Given a Transfer type transaction, an Expense account should not be applicable to it.
            const inputTransaction = createTransaction({transactionType: Transaction.TRANSFER});

            const {outputTransaction} = applySingleRule(rule, inputTransaction);

            // The account should not have gotten assigned to the transaction.
            expect(outputTransaction.creditAccountId).not.toBe(expenseAccount.id);
            expect(outputTransaction.debitAccountId).not.toBe(expenseAccount.id);
        });

        it("nullifies the import account when applying a type action that doesn't match", () => {
            const rule = createRule({
                actionProperty: "type",
                actionValue: Transaction.DEBT
            });

            // Given a transaction with an Asset import account, trying to apply a Debt type
            // to the transaction should remove the import account from the transaction.
            const inputTransaction = createTransaction();
            inputTransaction.debitAccountId = assetAccount.id;

            const {outputTransaction} = applySingleRule(rule, inputTransaction);

            // The asset account should be removed but the transaction should have the Debt type.
            expect(outputTransaction.debitAccountId).toBe("");
            expect(outputTransaction.type).toBe(Transaction.DEBT);
        });

        it("applies type actions before account actions", () => {
            const rule = createRule({
                actionProperty: ImportRuleAction.PROPERTY_ACCOUNT,
                actionValue: expenseAccount.id
            });

            const typeAction = new ImportRuleAction({
                property: "type",
                value: Transaction.EXPENSE
            });

            // Purposefully order the Account action before the Type action, to prove that
            // the Type action explicity gets applied first.
            rule.importRuleActions = [...rule.importRuleActions, typeAction];

            // Explicitly make it an Income transaction, since an Expense account wouldn't
            // be applied to it unless the Type action got applied first.
            const inputTransaction = createTransaction({transactionType: Transaction.INCOME});
            inputTransaction.debitAccountId = assetAccount.id;

            const {outputTransaction} = applySingleRule(rule, inputTransaction);

            // The type should be changed and the account should be applied.
            expect(outputTransaction.creditAccountId).toBe(assetAccount.id);
            expect(outputTransaction.debitAccountId).toBe(expenseAccount.id);
            expect(outputTransaction.type).toBe(Transaction.EXPENSE);
        });

        it("can remove the import account if it isn't valid after changing types", () => {
            const rule = createRule({
                actionProperty: "type",
                actionValue: Transaction.DEBT
            });

            // Use an Income transaction as the base since changing the type to Debt should cause
            // the Asset account to be removed since Asset isn't a valid account type for Debt.
            const inputTransaction = createTransaction({transactionType: Transaction.INCOME});
            inputTransaction.debitAccountId = assetAccount.id;

            const {outputTransaction} = applySingleRule(rule, inputTransaction);

            // The asset account should have been removed, but the type still applied.
            expect(outputTransaction.creditAccountId).toBe("");
            expect(outputTransaction.debitAccountId).toBe("");
            expect(outputTransaction.type).toBe(Transaction.DEBT);
        });
    });

    it("applies rules in order of highest rank (complexity) to lowest", () => {
        const expectedFinalValue = "xyz";

        const rule1 = createRule({
            conditionValue: "v",
            actionValue: "ab"
        });

        const rule2 = createRule({
            conditionValue: "va",
            actionValue: "cde"
        });

        const rule3 = createRule({
            conditionValue: "val",
            actionValue: expectedFinalValue
        });

        // Purposefully sort the rules in the non-ranked order.
        const rules = [rule1, rule3, rule2];

        const inputTransaction = createTransaction();

        const {activeRuleIds, transactions} = ImportRulesApplier.applyRules(
            rules,
            [inputTransaction],
            accountsById
        );

        const outputTransaction = transactions[inputTransaction.id];

        // Only the highest-ranked rule should have been applied.
        expect(activeRuleIds).toHaveLength(1);
        expect(activeRuleIds).toContain(rule3.id);

        // The output transaction should have the action value of only the highest-ranked rule.
        expect(outputTransaction.description).toBe(expectedFinalValue);
    });

    it("can have rules layer their actions on top of each other", () => {
        // Because of the rule ranking, rules can only be chained like this if the conditions
        // are sorted by rank. As such, each subsequent value has to be shorter than the last.
        const firstNewValue = "abcd";
        const secondNewValue = "efg";
        const finalNewValue = "hi";

        const rule1 = createRule({
            actionValue: firstNewValue
        });

        const rule2 = createRule({
            conditionValue: firstNewValue,
            actionValue: secondNewValue
        });

        const rule3 = createRule({
            conditionValue: secondNewValue,
            actionValue: finalNewValue
        });

        // Purposefully sort the rules in the non-ranked order.
        const rules = [rule1, rule3, rule2];

        const inputTransaction = createTransaction();

        const {activeRuleIds, transactions} = ImportRulesApplier.applyRules(
            rules,
            [inputTransaction],
            accountsById
        );

        const outputTransaction = transactions[inputTransaction.id];

        // All rules should have been activated.
        expect(activeRuleIds).toHaveLength(rules.length);
        expect(activeRuleIds).toContain(rule1.id);
        expect(activeRuleIds).toContain(rule2.id);
        expect(activeRuleIds).toContain(rule3.id);

        // The output transaction should have the action value of the (last) highest-ranked rule.
        expect(outputTransaction.description).toBe(finalNewValue);
    });
});
