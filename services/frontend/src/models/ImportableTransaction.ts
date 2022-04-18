import {NonFunctionProperties, Id} from "utils/types";
import Account, {AccountData} from "./Account";
import Transaction, {TransactionData, TransactionSide, TransactionType} from "./Transaction";

// Note: Since we currently only use bulk editing in the import process, the complete list of editable
// properties is defined alongside ImportableTransaction, since the current set of bulk actions
// includes `includeInImport`.
//
// However, if/when we implement bulk editing of regular transactions, this property will have to be
// split into two (one representing the properties from Transaction, one for ImportableTransaction).
export type BulkEditableTransactionProperty =
    | "creditAccountId"
    | "debitAccountId"
    | "amount"
    | "date"
    | "description"
    | "type"
    | "includeInImport";

export interface ImportableTransactionData extends NonFunctionProperties<ImportableTransaction> {}

interface ImportableTransactionConstructor
    extends Omit<ImportableTransaction, "date" | "createdAt" | "updatedAt"> {
    date: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/* This is a specialized version of the Transaction model that is used
 * in the transaction import process. It just adds a couple extra properties
 * for making transactions easier to work with in the import process. */
export default class ImportableTransaction extends Transaction {
    includeInImport: boolean;
    isDuplicate: boolean;

    /** OK, so 'targetAccount' is kind of a weird and ambiguous name, so let me explain its usage.
     *  Basically, by 'target' I mean 'which account needs to be filled out by the user to complete
     *  the import process'.
     *
     *  The 'target account' is the opposite of the 'import account', which is the account the user specifies
     *  at the beginning of the import process to signify which asset or liability the transaction is
     *  being imported _to_. However, the notion of an `importAccount` property doesn't exist, because
     *  the account ID just gets thrown into one of `creditAccountId` or `debitAccountId`
     *  (depending on the transaction type). As opposed to the `targetAccount`, which is the raw string
     *  value of an account's 'name' as taken from the user's submitted file (as specified by the
     *  `targetAccount` ImportProfileMappingField).
     *
     *  As such, the _value_ of the `targetAccount` is just a raw, user provided string. It is _not_ a
     *  uFincs account ID nor an account object.
     *
     *  In practice, the `targetAccount` is just used as a placeholder (literally or metaphorically)
     *  for an actual uFincs account, which gets slotted into the credit/debit account opposite to the
     *  'import account'. */
    targetAccount: string;

    constructor({
        targetAccount = "",
        includeInImport = true,
        isDuplicate = false,
        ...otherProperties
    }: Partial<ImportableTransactionConstructor> = {}) {
        super(otherProperties);

        // Whether or not the transaction will actually be imported.
        this.includeInImport = includeInImport;

        // Whether or not the transaction is a possible duplicate.
        this.isDuplicate = isDuplicate;

        // Used during the import process as a placeholder for the real account in the
        // TransactionsImportTable. This is because it is unlikely that the 'account' value
        // that would be parsed from a CSV file would actually match an account in uFincs.
        this.targetAccount = targetAccount;
    }

    /** Determines the (default) type of an ImportableTransaction based on the type of the account it
     *  is being imported to, and whether or not its amount is positive or negative. */
    determineTransactionType(accountBeingImportedTo: Account) {
        const {amount} = this;
        const {type: accountType} = accountBeingImportedTo;

        if (accountType === Account.ASSET) {
            this.type = amount > 0 ? Transaction.INCOME : Transaction.EXPENSE;
        } else if (accountType === Account.LIABILITY) {
            this.type = amount > 0 ? Transaction.DEBT : Transaction.TRANSFER;
        } else {
            // Default value, since only Asset and Liability accounts should be importable to.
            // No particular reason to use income, besides that it's the 'first' of the types.
            this.type = Transaction.INCOME;
        }
    }

    /* Used to populate transaction data (from, e.g., a redux store) with account data.
     *
     * It's setup in such a way so that it can be used to map over a set of transactions given
     * a set of accounts. */
    static populateTransaction(
        accountsById: Record<Id, AccountData>
    ): (transactionData: Partial<ImportableTransactionData>) => ImportableTransaction {
        return (transactionData: Partial<ImportableTransactionData>): ImportableTransaction => {
            const transaction = new ImportableTransaction(transactionData);
            const {creditAccountId, debitAccountId} = transaction;

            transaction.creditAccount = creditAccountId
                ? accountsById[transaction.creditAccountId]
                : {};

            transaction.debitAccount = debitAccountId
                ? accountsById[transaction.debitAccountId]
                : {};

            return transaction;
        };
    }

    /** Used to determine which side of the transaction each of the 'target' and 'import' accounts
     *  fall on. That is, whether or not the target account is credit or the debit account,
     *  and whether or not the 'import' account is the credit or the debit account.
     *
     *  The logic to determine this is _technically_ based on `determineAccountTypes` (in that,
     *  the target account is whatever isn't the asset/liability account, and the import account is
     *  whatever _is_ the asset/liability account; except for Transfer, where the target is always
     *  the credit and the import is always the debit, just because either can asset/liability). */
    static determineTargetTransactionSides(type: TransactionType): {
        targetAccount: TransactionSide;
        importAccount: TransactionSide;
    } {
        let targetAccount: TransactionSide = "credit";
        let importAccount: TransactionSide = "debit";

        switch (type) {
            case Transaction.INCOME:
                targetAccount = "credit";
                importAccount = "debit";
                break;
            case Transaction.EXPENSE:
                targetAccount = "debit";
                importAccount = "credit";
                break;
            case Transaction.DEBT:
                targetAccount = "debit";
                importAccount = "credit";
                break;
            case Transaction.TRANSFER:
                // Note: Transfer type transactions always have the target account as the debit,
                // just as a rule of thumb. Why? Because assets and liabilities can go on both sides.
                targetAccount = "debit";
                importAccount = "credit";
                break;
            default:
                break;
        }

        return {targetAccount, importAccount};
    }

    /** Handles changing swapping the accounts around with the expectation of a new type being assigned
     *  to the transaction, so that the accounts are valid for the given new type.
     *
     *  This is used, for example, when bulk changing the type of a transaction.
     *
     *  Note that there's nothing technically tying this function to ImportableTransaction over Transaction,
     *  but since it's currently only used in the import process, it's fine putting it here (for now).
     *
     *  Also note that this logic is heavily tied to Transaction.determineAccountTypes. */
    static swapAccountsForNewType(transaction: TransactionData, newType: TransactionType): void {
        const {type: oldType, creditAccountId, debitAccountId} = transaction;

        switch (oldType) {
            case Transaction.INCOME:
                switch (newType) {
                    case Transaction.EXPENSE:
                        transaction.creditAccountId = debitAccountId;
                        transaction.debitAccountId = "";
                        break;
                    case Transaction.DEBT:
                        transaction.creditAccountId = "";
                        transaction.debitAccountId = "";
                        break;
                    case Transaction.TRANSFER:
                        transaction.creditAccountId = "";
                        // Leave debitAccountId alone. It's an asset, which is valid here.
                        break;
                }

                break;
            case Transaction.EXPENSE:
                switch (newType) {
                    case Transaction.INCOME:
                        transaction.creditAccountId = "";
                        transaction.debitAccountId = creditAccountId;
                        break;
                    case Transaction.DEBT:
                        transaction.creditAccountId = "";
                        // Leave debitAccountId alone. It's an expense, which is valid here.
                        break;
                    case Transaction.TRANSFER:
                        // Leave creditAccountId alone. It's an asset, which is valid here.
                        transaction.debitAccountId = "";
                        break;
                }

                break;
            case Transaction.DEBT:
                switch (newType) {
                    case Transaction.INCOME:
                        transaction.creditAccountId = "";
                        transaction.debitAccountId = "";
                        break;
                    case Transaction.EXPENSE:
                        transaction.creditAccountId = "";
                        // Leave debitAccountId alone. It's an expense, which is valid here.
                        break;
                    case Transaction.TRANSFER:
                        // Leave creditAccountId alone. It's a liability, which is valid here.
                        transaction.debitAccountId = "";
                        break;
                }

                break;
            case Transaction.TRANSFER:
                switch (newType) {
                    case Transaction.INCOME:
                        transaction.creditAccountId = "";
                        // Leave debitAccountId alone. It's an asset, which is valid here.
                        break;
                    case Transaction.EXPENSE:
                        // Leave creditAccountId alone. It's an asset, which is valid here.
                        transaction.debitAccountId = "";
                        break;
                    case Transaction.DEBT:
                        // Leave creditAccountId alone. It's a liability, which is valid here.
                        transaction.debitAccountId = "";
                        break;
                }

                break;
        }
    }
}
