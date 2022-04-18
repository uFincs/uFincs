import {
    AccountData,
    ImportRule,
    ImportRuleAction,
    ImportRuleCondition,
    ImportableTransaction,
    ImportableTransactionData,
    Transaction,
    TransactionType
} from "models/";
import {arrayToObject} from "utils/helperFunctions";
import {Id} from "utils/types";

export default class ImportRulesApplier {
    static applyRules(
        rules: Array<ImportRule>,
        transactions: Array<ImportableTransactionData>,
        accountsById: Record<Id, AccountData>
    ): {activeRuleIds: Array<Id>; transactions: Record<Id, ImportableTransactionData>} {
        // Sort the rules by rank descending, so that rules with higher rank take precedence over
        // rules with lower rank. In effect, this means that if two rules were to affect the same
        // transaction, then the one with higher rank would apply first, thus (potentially) nullifying
        // the second rule.
        rules = ImportRule.sort(rules, "rule", "desc");

        // Need to pre-populate the appliedTransactions wth all the transactions so that all
        // transactions are present in the final result, even if there are no rules that apply
        // to a transaction.
        const appliedTransactions: Record<Id, ImportableTransactionData> =
            arrayToObject(transactions);

        // The active rule IDs is managed as a hashmap for performance reasons (can keep inserting
        // active rules without having to check if they've already been added).
        const activeRuleIds: Record<Id, Id> = {};

        for (let transaction of transactions) {
            const {id} = transaction;

            for (const rule of rules) {
                // Refresh the transaction with the applied transaction so that rules can
                // apply on top of each other.
                transaction = appliedTransactions[id];

                if (ImportRulesApplier.transactionMatchesRule(rule, transaction)) {
                    // Mark the rule as an active rule.
                    activeRuleIds[rule.id] = rule.id;

                    const appliedTransaction = ImportRulesApplier.applyRule(
                        rule,
                        transaction,
                        accountsById
                    );

                    // Update the transaction.
                    appliedTransactions[appliedTransaction.id] = appliedTransaction;
                }
            }
        }

        // Convert the active rule IDs into an array since that's what the Transactions Import
        // slice expects.
        return {activeRuleIds: Object.values(activeRuleIds), transactions: appliedTransactions};
    }

    static applyRule(
        rule: ImportRule,
        transaction: ImportableTransactionData,
        accountsById: Record<Id, AccountData>
    ): ImportableTransactionData {
        const transactionCopy = new ImportableTransaction(transaction);

        for (const action of ImportRuleAction.sortByApplyOrder(rule.importRuleActions)) {
            const {property, value} = action;

            const sides = ImportableTransaction.determineTargetTransactionSides(
                transactionCopy.type
            );

            switch (property) {
                case ImportRuleAction.PROPERTY_ACCOUNT:
                    // Unlike below, with applying types, there's no reasonable way to modify
                    // a transaction to forcefully apply an account change. We'd have to change the
                    // transaction's type, but then we'd get into weird cases where the account
                    // and type actions are just overriding each other.
                    //
                    // As such, only apply the account change if it's possible.
                    //
                    // Note that this can lead to scenarios where rules are only _partially_ applied.
                    // For the time being, this is considered TECH DEBT since we do not handle these
                    // cases in any special manner — rules are just applied on a best-effort basis.
                    //
                    // This will certainly be confusing for the end user, so we'll either need some
                    // sort of docs on how the rules/import system works, or some sort of
                    // help/reminder text explaining that 'type' actions are applied before
                    // 'account' actions.
                    if (accountCanBeApplied(transactionCopy, accountsById, value)) {
                        transactionCopy[
                            Transaction.mapTransactionSideToAccount(sides.targetAccount)
                        ] = value;
                    }

                    break;

                case ImportRuleAction.PROPERTY_DESCRIPTION:
                    transactionCopy.description = value;

                    break;

                case ImportRuleAction.PROPERTY_TYPE:
                    // Just like when during bulk update, make sure the import account is on the right
                    // side for the new type.
                    ImportableTransaction.swapAccountsForNewType(
                        transactionCopy,
                        value as TransactionType
                    );

                    transactionCopy.type = value as TransactionType;

                    break;
            }
        }

        return transactionCopy;
    }

    static transactionMatchesRule(
        rule: ImportRule,
        transaction: ImportableTransactionData
    ): boolean {
        return rule.importRuleConditions.reduce<boolean>((acc, {condition, property, value}) => {
            if (!acc || !property) {
                return false;
            }

            let propertyValue = "";

            switch (property) {
                case ImportRuleCondition.PROPERTY_ACCOUNT:
                    propertyValue = transaction.targetAccount;
                    break;

                case ImportRuleCondition.PROPERTY_DESCRIPTION:
                    propertyValue = transaction.description;
                    break;
            }

            // Treat all values as lower case, so that everything is considered case-insensitive.
            // I consider this to be a better UX since the chances that a user is frustrated by it
            // _not_ being case-insensitive is likely higher than the chances a user _needs_ it to
            // be case sensitive.
            propertyValue = propertyValue.toLowerCase();
            value = value.toLowerCase();

            switch (condition) {
                case ImportRuleCondition.CONDITION_CONTAINS:
                    return acc && propertyValue.includes(value);
                case ImportRuleCondition.CONDITION_MATCHES:
                    const regex = new RegExp(value);
                    return acc && regex.test(propertyValue);
                default:
                    return false;
            }
        }, true);
    }
}

const accountCanBeApplied = (
    transaction: Transaction,
    accountsById: Record<Id, AccountData>,
    accountId: Id
): boolean => {
    const sides = ImportableTransaction.determineTargetTransactionSides(transaction.type);
    const validAccountTypes = Transaction.determineAccountTypes(transaction.type);

    const targetAccount = accountsById?.[accountId];

    return (
        // If the target account exists...
        targetAccount &&
        // and the target account is a valid credit account given the transaction's type...
        ((sides.targetAccount === "credit" &&
            validAccountTypes.creditAccountTypes.includes(targetAccount.type)) ||
            /// or a valid debit account given the transaction's type...
            (sides.targetAccount === "debit" &&
                validAccountTypes.debitAccountTypes.includes(targetAccount.type)))
    );
};
