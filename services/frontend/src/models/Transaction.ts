import {v4 as uuidv4} from "uuid";
import {DateService, ValueConversion} from "services/";
import {sortStrings} from "utils/helperFunctions";
import {
    Cents,
    Id,
    NonFunctionPropertyNames,
    NonFunctionProperties,
    TableSortDirection,
    UTCDateString
} from "utils/types";
import InputValidation from "values/inputValidation";
import Account, {AccountType, AccountData} from "./Account";

/** OK, I don't really know where this should go, but we need to get our terminology straight
 *  here regarding 'transactions'. That is, the different types of transactions and what we call them.
 *  I figured the base `Transaction` model was a good a place as any to put this.
 *
 *  "transaction" or "regular transaction" = An instance or data of the Transaction model in this file
 *      -> This is the first and most important transaction. Every other 'type' of transaction is
 *         based off this model in some way, shape, or form.
 *
 *  "recurring transaction" = A template for defining a regular transaction combined with a schedule
 *                            that dictates when to create regular transactions using the template.
 *      -> A recurring transaction holds all the same properties as a regular transaction, except
 *          for the date. Instead, it has a number of properties that dictate what dates to create
 *          regular transactions on (using the `rrule` library).
 *
 *  From recurring transactions, we get a bunch of different 'types' of transactions.
 *  Really, they aren't different in what data they hold, but different in how they're used.
 *
 *  "concrete transaction" = A regular transaction that has been 'realized' from a recurring transaction.
 *      -> "Realization" is the process of converting the schedule and template of a recurring transaction
 *         into a regular transaction. That is, it makes the 'abstract' idea of a recurring transaction
 *         into the 'concrete' data (from a user's POV) of a transaction.
 *
 *  "virtual transaction" = A transaction that has been realized from a recurring transaction but is
 *                          in the future.
 *      -> While concrete transactions must have dates that are either in the present or the past,
 *         virtual transactions represent the realizations of a recurring transaction that have not
 *         yet happened. To be even more technical, concrete transactions exist in the backend database,
 *         but virtual transactions only exist on the frontend for the purposes of letting a user forecast
 *         their finances into the future.
 *
 *  "realized transaction" = A "concrete" or "virtual" transaction that comes from a recurring transaction.
 *      -> This should be self-explanatory, given the above. A realized transaction just refers to any
 *         transaction that came from the template and schedule of a recurring transaction.
 *
 *  "future transaction" = Any regular transaction with a date that is in the future (relative to today).
 *      -> Practically, a future transaction is any regular transaction (created by the user) with a date
 *         in the future and any virtual transaction (since they are, by definition, in the future).
 *
 *  Finally, unrelated to recurring transactions, are the following:
 *
 *  "importable transaction" = An instance or data of the "ImportableTransaction" class.
 *      -> These are transactions used during the import process, with some extra metadata that makes them
 *         easier to work with in the import process. They are eventually converted into regular transactions
 *         as part of the import process. */

// Look, I don't know 'what' a 'credit' or a 'debit' is. Like, the noun used to describe the category
// that these words come from. So... we're calling them 'transaction sides'. That is, a credit or debit
// is which 'side' the transaction operates on. Or something. Comp sci rule 2.
export type TransactionSide = "credit" | "debit";

export enum TransactionType {
    income = "income",
    expense = "expense",
    debt = "debt",
    transfer = "transfer"
}

export type TransactionSortOption = "date" | "description" | "amount" | "from" | "to";

export interface TransactionData
    extends Omit<NonFunctionProperties<Transaction>, "creditAccount" | "debitAccount"> {
    creditAccount?: Partial<Account>;
    debitAccount?: Partial<Account>;
}

interface TransactionConstructor
    extends Omit<Transaction, "amount" | "date" | "createdAt" | "updatedAt"> {
    amount: Cents | string;
    date: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface TransactionConstructorOptions {
    /** Disabling the date checks (i.e. converting the constructor date params using `DateService`)
     *  is a performance optimization when dealing with _large_ numbers of (virtual) transactions.
     *
     *  Only enable this if you're sure that the date strings being passed are valid. */
    disableDateChecks?: boolean;
}

export default class Transaction {
    id: Id;
    creditAccountId: Id;
    debitAccountId: Id;
    recurringTransactionId?: Id | null;

    amount: Cents;
    date: string;
    description: string;
    notes: string;
    type: TransactionType;
    createdAt: string;
    updatedAt: string;

    // Properties only used client-side.

    // Originally, the determination for whether or not a transaction was virtual was done by checking
    // if it was future-dated and had a recurringTransactionId attached. Well, then I realized that there's
    // _technically_ a case where a concretely realized transaction could fulfill both those conditions:
    // if you manually change your date/time to the future realize a recurring transaction, and change your
    // date/time back. Once time has been reverted, the result is that a realized transaction is created
    // for the recurring transaction _along with_ a virtual transaction. This results in a less-than-pleasant
    // UI where the virtual and realized transactions are styled the same.
    //
    // However, by introducing this `isVirtual` flag, we can explicitly flag virtual transactions and
    // make this problem go away.
    //
    // Something else to note is that, even if we changed the virtual transaction creation process so that
    // it wouldn't create virtual transactions if a realized transaction already exists on a date, it
    // wouldn't help the style issues; the realized transaction would still display like a virtual transaction.
    isVirtual?: boolean;

    // Properties derived from store.
    creditAccount: Partial<Account>;
    debitAccount: Partial<Account>;

    static TRANSACTION_TYPES = Object.values(TransactionType);
    static INCOME = TransactionType.income;
    static EXPENSE = TransactionType.expense;
    static DEBT = TransactionType.debt;
    static TRANSFER = TransactionType.transfer;

    static PLURAL_TYPES = {
        [TransactionType.income]: "Income",
        [TransactionType.expense]: "Expenses",
        [TransactionType.debt]: "Debts",
        [TransactionType.transfer]: "Transfers"
    };

    static DATE_FILTER_ALL = "all";
    static DATE_FILTER_MONTHLY = "monthly";

    static SORT_MAP = {
        date: Transaction.dateSortAsc,
        description: Transaction.stringPropertySortAsc("description"),
        amount: Transaction.amountSortAsc,
        from: Transaction.accountPropertySortAsc("leftAccount"),
        to: Transaction.accountPropertySortAsc("rightAccount")
    } as const;

    static SORT_DEFAULT_DIRECTION = {
        date: "desc",
        description: "asc",
        amount: "desc",
        from: "asc",
        to: "asc"
    } as const;

    constructor(
        {
            id = uuidv4(),
            creditAccountId = "",
            debitAccountId = "",
            recurringTransactionId,
            amount = 0,
            date = DateService.getTodayDate(),
            description = "",
            notes = "",
            type = TransactionType.income,
            createdAt = DateService.getTodayDateTime(),
            updatedAt = DateService.getTodayDateTime(),
            isVirtual = undefined,
            creditAccount = {},
            debitAccount = {}
        }: Partial<TransactionConstructor> = {},
        {disableDateChecks = false}: Partial<TransactionConstructorOptions> = {}
    ) {
        this.id = id;
        this.creditAccountId = creditAccountId;
        this.debitAccountId = debitAccountId;
        this.recurringTransactionId = recurringTransactionId;

        this.description = description;
        this.notes = notes;
        this.type = type;

        this.createdAt =
            disableDateChecks && typeof createdAt === "string"
                ? createdAt
                : DateService.convertToTimestamp(createdAt);

        this.updatedAt =
            disableDateChecks && typeof updatedAt === "string"
                ? updatedAt
                : DateService.convertToTimestamp(updatedAt);

        // If we are passed an empty string, we want to assign it as the date.
        // If we pass an empty string to the DateService, it'll throw an Invalid Date error.
        if (disableDateChecks && date && typeof date === "string") {
            this.date = date;
        } else {
            try {
                this.date = date
                    ? DateService.convertToTimestamp(DateService.stripTime(date))
                    : date === undefined || date === null
                      ? ""
                      : date;
            } catch (e) {
                console.error(e);
                console.log({date});

                this.date = "";
            }
        }

        // Contingency against the Backend giving us strings instead of numbers.
        // This happened once after the BIGINT switch for numbers.
        // Also, encrypted amounts that are then decrypted always come back as strings.
        // As such, they have to be converted back to numbers.
        if (typeof amount === "string") {
            // `|| 0` handles the NaN case where the amount isn't a proper number.
            this.amount = parseInt(amount) || 0;
        } else {
            this.amount = amount ? amount : 0;
        }

        // Client-side only properties
        this.isVirtual = isVirtual;

        // Aggregate properties
        this.creditAccount = creditAccount;
        this.debitAccount = debitAccount;
    }

    convertAmountToCents(): void {
        this.amount = ValueConversion.convertDollarsToCents(this.amount);
    }

    validate(): Transaction {
        const {amount, date, description, type, creditAccountId, debitAccountId} = this;

        if (amount !== 0 && (!amount || isNaN(amount) || amount > InputValidation.maxNumber)) {
            throw new Error("Invalid amount");
        }

        if (!isNaN(amount) && amount < 0) {
            throw new Error("Amount negative");
        }

        if (!date) {
            throw new Error("Missing date");
        }

        if (!description) {
            throw new Error("Missing description");
        }

        if (!(type in TransactionType)) {
            throw new Error("Invalid type");
        }

        const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(type);
        const creditAccountType = creditAccountTypes.join("/");
        const debitAccountType = debitAccountTypes.join("/");

        if (!creditAccountId) {
            throw new Error(`Missing ${creditAccountType} account`);
        }

        if (!debitAccountId) {
            throw new Error(`Missing ${debitAccountType} account`);
        }

        if (creditAccountId === debitAccountId) {
            throw new Error("Accounts can't be the same");
        }

        return this;
    }

    /** Ensures that the two accounts on a transaction are valid given the type of
     *  transaction and the accounts. Useful for the import process. */
    static accountsAreValid(
        transaction: TransactionData,
        accountsById: Record<Id, AccountData>
    ): boolean {
        const creditAccount = accountsById?.[transaction.creditAccountId];
        const debitAccount = accountsById?.[transaction.debitAccountId];

        if (!creditAccount || !debitAccount) {
            return false;
        }

        const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(
            transaction.type
        );

        if (
            !creditAccountTypes.includes(creditAccount.type) ||
            !debitAccountTypes.includes(debitAccount.type)
        ) {
            return false;
        }

        return true;
    }

    /** Checks if the accounts for a new transaction have changed vs the old version of the transaction. */
    static accountsChanged(
        oldTransaction: TransactionData,
        newTransaction: TransactionData
    ): boolean {
        return (
            oldTransaction.creditAccountId !== newTransaction.creditAccountId ||
            oldTransaction.debitAccountId !== newTransaction.debitAccountId
        );
    }

    static extractDataFields(object: any): Omit<TransactionData, "creditAccount" | "debitAccount"> {
        try {
            const {
                id,
                creditAccountId,
                debitAccountId,
                recurringTransactionId,
                amount,
                date,
                description,
                notes,
                type,
                createdAt,
                updatedAt
            } = object;

            return {
                id,
                creditAccountId,
                debitAccountId,
                recurringTransactionId,
                amount,
                date,
                description,
                notes,
                type,
                createdAt,
                updatedAt
            };
        } catch {
            throw new Error("Failed to extract data from transaction");
        }
    }

    /* Sorts transactions ascending first by 'date' and then by 'createdAt'.
     *
     * @param {Transaction} a   The first transaction.
     * @param {Transaction} b   The second transaction.
     *
     * @return The sort order of the two transactions.
     */
    static dateSortAsc(a: TransactionData, b: TransactionData): number {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

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

        const createdAtA = new Date(a.createdAt);
        const createdAtB = new Date(b.createdAt);

        if (createdAtA > createdAtB) {
            return 1;
        } else if (createdAtA < createdAtB) {
            return -1;
        }

        // [UFC-403] If, at this point, transactions are still the same, then they are likely
        // two virtual transaction that happen on the same day. As it turns out, if we return 0
        // at this point, the descending and ascending sorts won't be the same. This will cause
        // the running balances in Account Details to not match with the displayed order of the transactions,
        // because `Account.calculateRunningBalances` uses ascending sort whereas the default date
        // sort is descending.
        //
        // As such, we need to further disambiguate the transactions. So we do a sort on amount
        // and then a sort on descriptions.
        const amountSort = Transaction.amountSortAsc(a, b);

        if (amountSort !== 0) {
            return amountSort;
        }

        const descriptionSort = Transaction.stringPropertySortAsc("description")(a, b);

        if (descriptionSort !== 0) {
            return descriptionSort;
        }

        // If, at this point, the transactions are still identical... I don't know what to tell ya.
        // It shouldn't matter since they are practically identical.
        return 0;
    }

    /* Sorts transactions ascending by 'amount'.
     *
     * @param {Transaction} a   The first transaction.
     * @param {Transaction} b   The second transaction.
     *
     * @return The sort order of the two transactions.
     */
    static amountSortAsc(a: TransactionData, b: TransactionData): number {
        const amountA = parseFloat(a.amount.toString());
        const amountB = parseFloat(b.amount.toString());

        if (amountA > amountB) {
            return 1;
        } else if (amountA < amountB) {
            return -1;
        } else {
            return 0;
        }
    }

    /* Sorts transactions ascending by the given transaction property that is a string.
     *
     * @param {string} property The string property to sort by.
     *
     * @param {Transaction} a   The first transaction.
     * @param {Transaction} b   The second transaction.
     *
     * @return The sort order of the two transactions.
     */
    static stringPropertySortAsc(
        property: NonFunctionPropertyNames<
            Omit<Transaction, "recurringTransactionId" | "isVirtual">
        >
    ): (a: TransactionData, b: TransactionData) => number {
        return (a: TransactionData, b: TransactionData) => {
            const stringA = (a[property] as string).toLowerCase();
            const stringB = (b[property] as string).toLowerCase();

            return sortStrings(stringA, stringB);
        };
    }

    static accountPropertySortAsc(accountProperty: "leftAccount" | "rightAccount"): (
        // We need to support the `targetAccount` property of `ImportableTransaction` so that
        // we can properly sort transactions during the Adjust Transactions step of the Import Process.
        a: TransactionData & {targetAccount?: string},
        b: TransactionData & {targetAccount?: string}
    ) => number {
        return (a, b) => {
            const accountA = Transaction.determineAccountFlow(
                a.type,
                a.creditAccount?.name || a?.targetAccount || "",
                a.debitAccount?.name || a?.targetAccount || ""
            )[accountProperty].toLowerCase();

            const accountB = Transaction.determineAccountFlow(
                b.type,
                b.creditAccount?.name || b?.targetAccount || "",
                b.debitAccount?.name || b?.targetAccount || ""
            )[accountProperty].toLowerCase();

            if (accountA > accountB) {
                return 1;
            } else if (accountA < accountB) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    static sort(
        transactions: Array<TransactionData>,
        by: TransactionSortOption = "date",
        direction: TableSortDirection = "desc"
    ) {
        const sortFunction = Transaction.SORT_MAP[by];

        if (!sortFunction) {
            return transactions;
        }

        const callback = (a: TransactionData, b: TransactionData) => {
            // Remember, the result of sortFunction is -1, 0, or 1.
            // Multiplying it by -1 when `desc` is true inverts the order,
            // whereas multiplying it by 1 when `desc` is false keeps the ascending order.
            return sortFunction(a, b) * (direction === "desc" ? -1 : 1);
        };

        // Create a copy of the array so that we get a new reference.
        // Needed for cache busting with things like useMemo.
        return [...transactions].sort(callback);
    }

    /* Used to populate transaction data (from, e.g., a redux store) with account data.
     *
     * It's setup in such a way so that it can be used to map over a set of transactions given
     * a set of accounts. */
    static populateTransaction(
        accountsById: Record<Id, AccountData>,
        {disableDateChecks = false}: TransactionConstructorOptions = {}
    ): (transactionData: Partial<TransactionData>) => Transaction {
        return (transactionData: Partial<TransactionData>): Transaction => {
            const transaction = new Transaction(transactionData, {disableDateChecks});
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

    /** Assumes the transaction type mappings as determined by `Transaction.determineAccountTypes`.
     *
     *  @param {string}  type           The transaction type.
     *  @param {Account} creditAccount  The name of the account in the creditAccount of a transaction.
     *  @param {Account} debitAccount   The name of the account in the debitAccount of a transaction.
     *
     *  @returns {Object} An object of the form `{leftAccount: string, rightAccount: string}`. */
    static determineAccountFlow<T = string>(
        _type: TransactionType,
        creditAccount: T,
        debitAccount: T
    ): {
        leftAccount: T;
        rightAccount: T;
        // Need this index type so that `accountPropertySortAsc` can index the object.
        [key: string]: T;
    } {
        return {
            leftAccount: creditAccount,
            rightAccount: debitAccount
        };
    }

    /** Determines which account types are valid for the creditAccount and debitAccount
     *  Transaction properties.
     *
     *  @param {string} type    The transaction type.
     *
     *  @returns {Object} An object of the form `{creditAccount: string[], debitAccount: string[]}`. */
    static determineAccountTypes(type: TransactionType): {
        creditAccountTypes: Array<AccountType>;
        debitAccountTypes: Array<AccountType>;
    } {
        let creditAccountTypes: Array<AccountType>;
        let debitAccountTypes: Array<AccountType>;

        switch (type) {
            case Transaction.INCOME:
                creditAccountTypes = [Account.INCOME];
                debitAccountTypes = [Account.ASSET];
                break;
            case Transaction.EXPENSE:
                creditAccountTypes = [Account.ASSET];
                debitAccountTypes = [Account.EXPENSE];
                break;
            case Transaction.DEBT:
                creditAccountTypes = [Account.LIABILITY];
                debitAccountTypes = [Account.EXPENSE];
                break;
            case Transaction.TRANSFER:
                creditAccountTypes = [Account.ASSET, Account.LIABILITY];
                debitAccountTypes = [Account.ASSET, Account.LIABILITY];
                break;
            default:
                creditAccountTypes = [];
                debitAccountTypes = [];
        }

        return {creditAccountTypes, debitAccountTypes};
    }

    /** Maps "credit" or "debit" to "creditAccountId" or "debitAccountId". */
    static mapTransactionSideToAccount(
        side: TransactionSide
    ): "creditAccountId" | "debitAccountId" {
        if (side === "credit") {
            return "creditAccountId";
        } else {
            return "debitAccountId";
        }
    }

    /** Filters a list of transactions by the given account ID. */
    static filterByAccountId(
        transactions: Array<TransactionData>,
        accountId: Id
    ): Array<TransactionData> {
        return transactions.filter(
            (transaction) =>
                transaction.creditAccountId === accountId ||
                transaction.debitAccountId === accountId
        );
    }

    /** Calculates the sum of each type for a given list of transactions.  */
    static calculateAmountsByType(
        transactions: Array<TransactionData>
    ): Record<TransactionType, Cents> {
        return transactions.reduce(
            (acc, transaction) => {
                if (transaction) {
                    acc[transaction.type] += transaction.amount;
                }

                return acc;
            },
            {
                [TransactionType.income]: 0,
                [TransactionType.expense]: 0,
                [TransactionType.debt]: 0,
                [TransactionType.transfer]: 0
            }
        );
    }

    /** Takes a set of transactions (perhaps queried from the date index in the store),
     *  and indexes them by date for use when generating chart data points.
     *
     *  Note: The returned index is actually indexed by UTCDateString, but since we can't use
     *  opaque types as indices in TypeScript... just know that it's implied :) */
    static indexByDate(
        transactions: Array<TransactionData>,
        accountId: Id = ""
    ): Record<UTCDateString, Array<TransactionData>> {
        const result: Record<UTCDateString, Array<TransactionData>> = {};

        for (const transaction of transactions) {
            if (
                accountId &&
                !(
                    transaction.debitAccountId === accountId ||
                    transaction.creditAccountId === accountId
                )
            ) {
                continue;
            }

            const date = DateService.convertToUTCString(transaction.date);

            if (result[date] === undefined) {
                result[date] = [transaction];
            } else {
                result[date].push(transaction);
            }
        }

        return result;
    }

    /* This returns a map of all transactions that are related to a recurring transaction,
     * further indexed by the date of the transaction itself. That is:
     *
     *  {
     *      [recurringTransaction.id]: {
     *          [transaction.date]: transaction
     *      }
     *  }
     *
     *  This is used as part of the `realizeRecurringTransactions` saga to make sure we aren't realizing
     *  duplicate transactions.
     *
     *  Note: This function assumes that a recurring transaction cannot generate multiple transactions
     *  on the same day. */
    static indexByRecurringTransaction(
        transactions: Array<TransactionData>
    ): Record<Id, Record<string, TransactionData>> {
        const result: Record<Id, Record<string, TransactionData>> = {};

        for (const transaction of transactions) {
            const recurringId = transaction.recurringTransactionId;

            if (recurringId) {
                if (!result[recurringId]) {
                    result[recurringId] = {};
                }

                result[recurringId][DateService.convertToUTCString(transaction.date)] = transaction;
            }
        }

        return result;
    }

    /** Splits a list of transactions into separate lists of income and expense transactions. */
    static splitIncomeAndExpenses(transactions: Array<TransactionData>): {
        income: Array<TransactionData>;
        expenses: Array<TransactionData>;
    } {
        const income: Array<TransactionData> = [];
        const expenses: Array<TransactionData> = [];

        for (const transaction of transactions) {
            if (transaction.type === Transaction.INCOME) {
                income.push(transaction);
            } else if (
                transaction.type === Transaction.EXPENSE ||
                transaction.type === Transaction.DEBT
            ) {
                expenses.push(transaction);
            }
        }

        return {income, expenses};
    }

    /** Whether or not the first transaction is (strictly) newer than the second. */
    static isNewerTransaction(
        firstTransaction: TransactionData,
        secondTransaction: TransactionData
    ): boolean {
        const dateFirst = new Date(firstTransaction.date);
        const dateSecond = new Date(secondTransaction.date);

        return dateFirst > dateSecond;
    }

    /** Whether or not a transaction is in the future (not including today). */
    static isFutureTransaction(transaction: TransactionData): boolean {
        try {
            return !DateService.isLessThanOrEqual(transaction.date, DateService.getTodayDate());
        } catch {
            return false;
        }
    }

    /** Whether or not a transaction is 'virtual' (in the future and related to a recurring transaction). */
    static isVirtualTransaction(transaction: TransactionData): boolean {
        return !!transaction.isVirtual;
    }

    static generateTypeClass(type: TransactionType): string {
        return `transaction-type--${type}`;
    }
}
