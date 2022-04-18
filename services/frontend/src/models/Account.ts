import {v4 as uuidv4} from "uuid";
import {DateService, ValueConversion} from "services/";
import {sortStrings} from "utils/helperFunctions";
import objectReduce from "utils/objectReduce";
import {Cents, Id, Millipercents, NonFunctionProperties} from "utils/types";
import InputValidation from "values/inputValidation";
import Transaction, {TransactionData, TransactionType} from "./Transaction";

export enum AccountType {
    asset = "asset",
    liability = "liability",
    income = "income",
    expense = "expense"
}

export interface AccountOption {
    label: string;
    value: Id;
}

export interface AccountData
    extends Omit<NonFunctionProperties<Account>, "balance" | "transactions"> {
    balance?: Cents;
    transactions?: Array<Transaction>;
}

export type BulkEditableAccountProperty = "name" | "openingBalance";

interface AccountConstructor extends Omit<Account, "openingBalance" | "interest"> {
    openingBalance: Cents | string;
    interest: Millipercents | string;
}

export default class Account {
    id: Id;
    transactionIds: Array<Id>;
    name: string;
    type: AccountType;
    openingBalance: Cents;
    interest: Millipercents;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Properties derived from store.
    balance: Cents;
    transactions: Array<Transaction>;

    static ACCOUNT_TYPES = Object.values(AccountType);
    static ASSET = AccountType.asset;
    static LIABILITY = AccountType.liability;
    static INCOME = AccountType.income;
    static EXPENSE = AccountType.expense;

    static PLURAL_TYPES = {
        [AccountType.asset]: "Assets",
        [AccountType.liability]: "Liabilities",
        [AccountType.income]: "Income",
        [AccountType.expense]: "Expenses"
    };

    constructor({
        id = uuidv4(),
        transactionIds = [],
        name = "",
        type = AccountType.asset,
        openingBalance = 0,
        interest = 0,
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime(),
        balance = 0,
        transactions = []
    }: Partial<AccountConstructor> = {}) {
        this.id = id;
        this.transactionIds = transactionIds;

        this.name = name;
        this.type = type;
        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);

        // Contingency against the Backend giving us strings instead of numbers.
        // This happened once after the BIGINT switch for numbers.
        // Also, encrypted numbers that are then decrypted always come back as strings.
        // As such, they have to be converted back to numbers.
        if (typeof openingBalance === "string") {
            this.openingBalance = parseInt(openingBalance);
        } else {
            this.openingBalance = openingBalance ? openingBalance : 0;
        }

        if (typeof interest === "string") {
            this.interest = parseInt(interest);
        } else {
            this.interest = interest ? interest : 0;
        }

        // Aggregate properties
        this.balance = balance;
        this.transactions = transactions;
    }

    convertOpeningBalanceToCents(): void {
        this.openingBalance = ValueConversion.convertDollarsToCents(this.openingBalance);
    }

    convertInterestToMillipercents(): void {
        this.interest = ValueConversion.convertPercentToMillipercents(this.interest);
    }

    validate(): Account {
        const {name, type, openingBalance, interest} = this;

        if (!name) {
            throw new Error("Missing name");
        }

        if (!type) {
            throw new Error("Missing type");
        }

        if (
            openingBalance !== 0 &&
            (!openingBalance || isNaN(openingBalance) || openingBalance > InputValidation.maxNumber)
        ) {
            throw new Error("Invalid opening balance");
        }

        if (
            interest !== 0 &&
            (!interest || isNaN(interest) || interest > InputValidation.maxNumber)
        ) {
            throw new Error("Invalid interest rate");
        }

        if (!isNaN(openingBalance) && openingBalance < 0) {
            throw new Error("Opening balance negative");
        }

        if (!isNaN(interest) && interest < 0) {
            throw new Error("Interest rate negative");
        }

        if (!(type in AccountType)) {
            throw new Error("Invalid type");
        }

        return this;
    }

    mergeWithTransactions(transactionsById: Record<Id, Transaction>): void {
        this.transactions = this.transactionIds.reduce<Array<Transaction>>((acc, id) => {
            if (transactionsById[id]) {
                return [...acc, transactionsById[id]];
            } else {
                return acc;
            }
        }, []);
    }

    calculateBalance(): void {
        this.balance = Account.calculateBalance(this, this.transactions);
    }

    static extractDataFields(object: any): Omit<AccountData, "transactions"> {
        try {
            const {id, transactionIds, interest, openingBalance, name, type, createdAt, updatedAt} =
                object;

            return {
                id,
                transactionIds,
                interest,
                openingBalance,
                name,
                type,
                createdAt,
                updatedAt
            };
        } catch {
            throw new Error("Failed to extract data from account");
        }
    }

    /* Used to populate account data (from, e.g., a redux store) with transactions data,
     * along with performing calculations like total account balance.
     *
     * It's setup in such a way so that it can be used to map over a set of accounts given
     * a set of transactions. */
    static populateAccount(
        transactionsById: Record<Id, Transaction>
    ): (accountData: Partial<AccountData>) => Account {
        return (accountData: Partial<AccountData>) => {
            const account = new Account(accountData);
            account.mergeWithTransactions(transactionsById);
            account.calculateBalance();

            return account;
        };
    }

    static calculateBalance(
        account: AccountData,
        transactions: Array<TransactionData> = []
    ): Cents {
        return transactions.reduce<Cents>(Account.balanceReducer(account), account.openingBalance);
    }

    static calculateBalanceChange(
        account: AccountData,
        transactions: Array<TransactionData> = []
    ): Cents {
        return transactions.reduce<Cents>(Account.balanceReducer(account), 0);
    }

    /** Calculates the amount that every account's balance has changed using the given set
     *  of transactions. This is particularly useful when calculating balance changes between
     *  dates, since the set of transactions would just be the set of transactions between
     *  two dates. */
    static calculateAccountsBalanceChanges(
        accountsById: Record<Id, AccountData>,
        transactions: Array<TransactionData>
    ): Record<Id, AccountData> {
        // Need to deep copy the accountsById since we want the function to be pure and not
        // modify its arguments.
        // In reality, it's because the accountsById that's passed in is the actual
        // store state for the accounts. So if we modify it, we end up modifying the store state.
        // Big no no.
        const accountsByIdCopy: typeof accountsById = JSON.parse(JSON.stringify(accountsById));

        for (const transaction of transactions) {
            // Look, at this point, I don't even know how we're looping over a list that
            // contains undefined transactions, but somehow there's a race condition in the
            // e2e tests that causes this to happen. So... just conditionally access everything!
            const creditAccountId = transaction?.creditAccountId;
            const debitAccountId = transaction?.debitAccountId;

            const creditAccount = accountsByIdCopy[creditAccountId];
            const debitAccount = accountsByIdCopy[debitAccountId];

            // Need to guard against the accounts not existing (yet) because there's a race condition where
            // the transactions come in first before the accounts have been loaded.
            if (creditAccount) {
                creditAccount.balance = Account.balanceReducer(creditAccount)(
                    creditAccount.balance || 0,
                    transaction
                );
            }

            if (debitAccount) {
                debitAccount.balance = Account.balanceReducer(debitAccount)(
                    debitAccount.balance || 0,
                    transaction
                );
            }
        }

        return accountsByIdCopy;
    }

    /** Creates an `ID -> balance` map of the running balances for an account's transactions. */
    static calculateRunningBalances(
        transactions: Array<TransactionData>,
        account: AccountData | undefined,
        startingBalance: Cents | undefined
    ): Record<Id, Cents> {
        if (startingBalance !== undefined && account !== undefined) {
            // The transactions _have_ to be sorted by date, ascending, otherwise the running balance
            // values are entirely wrong.
            transactions = Transaction.sort(transactions, "date", "asc");

            const sequentialBalances = [startingBalance];
            const runningBalances = {} as Record<Id, Cents>;

            // Need indices so that we can refer to the last running balance when calculating
            // the next running balance.
            for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i];

                sequentialBalances[i] = Account.balanceReducer(account)(
                    // When it's the first transaction, we just use the startingBalance that's
                    // stored in the first spot.
                    sequentialBalances[Math.max(i - 1, 0)],
                    transaction
                );

                runningBalances[transaction.id] = sequentialBalances[i];
            }

            return runningBalances;
        } else {
            return {};
        }
    }

    static calculateNetWorth(balancesByType: Record<AccountType, Cents>): Cents {
        return balancesByType[AccountType.asset] - balancesByType[AccountType.liability];
    }

    static categorizeByType(
        accounts: Record<Id, AccountData>
    ): Record<AccountType, Array<AccountData>> {
        return Object.keys(accounts).reduce<Record<AccountType, Array<AccountData>>>(
            (acc, id) => {
                const account = accounts[id];
                acc[account.type] = [...acc[account.type], account];
                return acc;
            },
            {
                [AccountType.asset]: [],
                [AccountType.liability]: [],
                [AccountType.income]: [],
                [AccountType.expense]: []
            }
        );
    }

    static sumByType(
        accountsByType: Record<AccountType, Array<AccountData>>
    ): Record<AccountType, Cents> {
        return objectReduce(accountsByType, (accounts) =>
            accounts.reduce((balance, account) => balance + (account.balance || 0), 0)
        );
    }

    static sumOpeningBalancesByType(
        accountsByType: Record<AccountType, Array<AccountData>>
    ): Record<AccountType, Cents> {
        return objectReduce(accountsByType, (accounts) =>
            accounts.reduce((balance, account) => balance + account.openingBalance, 0)
        );
    }

    static generateAccountOptions(
        types: Array<AccountType> = [],
        accountsByType: Record<AccountType, Array<AccountData>>
    ): Array<AccountOption> {
        return Account._sortAccountOptions(
            Account._mapAccountsToOptions(Account.mapTypesToAccounts(types, accountsByType))
        );
    }

    /* Determines which transaction types are valid to be associated with the given account type.
     *
     * @param {string} type     The account type.
     *
     * @return {Array<String>}  The list of valid transaction types. */
    static determineTransactionTypes(type: AccountType): Array<TransactionType> {
        switch (type) {
            case AccountType.asset:
                return [Transaction.INCOME, Transaction.EXPENSE, Transaction.TRANSFER];
            case AccountType.liability:
                return [Transaction.DEBT, Transaction.TRANSFER];
            case AccountType.income:
                return [Transaction.INCOME];
            case AccountType.expense:
                return [Transaction.EXPENSE, Transaction.DEBT];
            default:
                return [];
        }
    }

    /** Determines whether or not an account type has an opening balance/interest. */
    static hasOpeningBalanceAndInterest(type?: AccountType): boolean {
        return type === Account.ASSET || type === Account.LIABILITY;
    }

    static mapTypesToAccounts(
        types: Array<AccountType> = [],
        accountsByType: Record<AccountType, Array<AccountData>>
    ): Array<AccountData> {
        return types.reduce<Array<AccountData>>(
            (acc, type) => [...acc, ...accountsByType[type]],
            []
        );
    }

    static _mapAccountsToOptions(accounts: Array<AccountData> = []): Array<AccountOption> {
        return accounts.map(({id, name}) => ({label: name, value: id}));
    }

    static _sortAccountOptions(accountOptions: Array<AccountOption>): Array<AccountOption> {
        return accountOptions.sort((a, b) => a.label.localeCompare(b.label));
    }

    /* Sorts accounts descending by balance.
     *
     * @param {Account} a   The first account.
     * @param {Account} b   The second account.
     *
     * @return The sort order of the two accounts. */
    static balanceSortDesc(
        a: Pick<AccountData, "balance">,
        b: Pick<AccountData, "balance">
    ): number {
        return (b.balance || 0) - (a.balance || 0);
    }

    static nameSortAsc(a: Pick<AccountData, "name">, b: Pick<AccountData, "name">): number {
        return sortStrings(a.name, b.name);
    }

    static netWorthReducer(balance: Cents, transaction: TransactionData): Cents {
        const {amount} = transaction;

        switch (transaction.type) {
            case Transaction.INCOME:
                return balance + amount;
            case Transaction.EXPENSE:
                return balance - amount;
            case Transaction.DEBT:
                return balance - amount;
            // Note: Transfer transactions do not affect Net Worth in any way, as unintuitive
            // as that sounds. This is mainly because doing something like a transfer from
            // asset to liability to pay off debt doesn't change net worth; the debt (i.e. the
            // expense) was already taken into account in the original debt transaction.
            //
            // As such, if we do include Transfer transactions in Net Worth calculation,
            // it is effectively double counting certain transactions.
            //
            // Note: I'm unsure how liability -> asset transfers actually affect this, mostly
            // because I don't really know when those types of transactions would take place
            // in practice. The only thing I can think of is when taking on something like a
            // loan, where the liability/debt results in an increase of cash. Although this
            // would probably be more modelled as an income transaction and a new liability
            // account with an opening balance equal to the amount of the loan.
            default:
                return balance;
        }
    }

    static balanceReducer(account: AccountData) {
        return (balance: Cents, transaction: Partial<TransactionData> = {}) => {
            switch (account.type) {
                case AccountType.asset:
                    return Account._assetBalanceReducer(account)(balance, transaction);
                case AccountType.liability:
                    return Account._liabilityBalanceReducer(account)(balance, transaction);
                case AccountType.income:
                    return Account._incomeBalanceReducer()(balance, transaction);
                case AccountType.expense:
                    return Account._expenseBalanceReducer()(balance, transaction);
            }
        };
    }

    static _assetBalanceReducer(account: AccountData) {
        return (balance: Cents, transaction: Partial<TransactionData> = {}): Cents => {
            const {amount = 0} = transaction;

            switch (transaction.type) {
                case Transaction.INCOME:
                    return balance + amount;
                case Transaction.EXPENSE:
                    return balance - amount;
                case Transaction.TRANSFER:
                    if (transaction.creditAccountId === account.id) {
                        return balance - amount;
                    } else if (transaction.debitAccountId === account.id) {
                        return balance + amount;
                    } else {
                        return balance;
                    }
                default:
                    return balance;
            }
        };
    }

    static _liabilityBalanceReducer(account: AccountData) {
        return (balance: Cents, transaction: Partial<TransactionData> = {}): Cents => {
            const {amount = 0} = transaction;

            switch (transaction.type) {
                case Transaction.DEBT:
                    return balance + amount;
                case Transaction.TRANSFER:
                    if (transaction.creditAccountId === account.id) {
                        return balance + amount;
                    } else if (transaction.debitAccountId === account.id) {
                        return balance - amount;
                    } else {
                        return balance;
                    }
                default:
                    return balance;
            }
        };
    }

    static _incomeBalanceReducer() {
        return (balance: Cents, transaction: Partial<TransactionData> = {}): Cents => {
            const {amount = 0} = transaction;

            switch (transaction.type) {
                case Transaction.INCOME:
                    return balance + amount;
                default:
                    return balance;
            }
        };
    }

    static _expenseBalanceReducer() {
        return (balance: Cents, transaction: Partial<TransactionData> = {}): Cents => {
            const {amount = 0} = transaction;

            switch (transaction.type) {
                case Transaction.EXPENSE:
                // falls through
                case Transaction.DEBT:
                    return balance + amount;
                default:
                    return balance;
            }
        };
    }
}
