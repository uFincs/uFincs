import {Account} from "models/";
import {DateService} from "services/";
import InputValidation from "values/inputValidation";
import Transaction, {TransactionType} from "./Transaction";

describe("Constructor", () => {
    it("converts string amounts to integers", () => {
        const transaction = new Transaction({amount: "123"});

        expect(transaction.amount).toBe(123);
    });
});

describe("validate", () => {
    const validTransaction = new Transaction({
        id: "1",
        creditAccountId: "2",
        debitAccountId: "3",
        amount: 0,
        date: new Date(),
        description: "A description",
        notes: "",
        type: Transaction.INCOME,
        createdAt: new Date(),
        updatedAt: new Date(),
        creditAccount: {},
        debitAccount: {}
    });

    it("doesn't throw an error for a valid transaction", () => {
        expect(() => validTransaction.validate()).not.toThrow();
    });

    it("checks for description existence", () => {
        const invalidTransaction = new Transaction({...validTransaction, description: ""});
        expect(() => invalidTransaction.validate()).toThrow("description");
    });

    it("checks for date existence", () => {
        const invalidTransaction = new Transaction({...validTransaction, date: ""});
        expect(() => invalidTransaction.validate()).toThrow("date");
    });

    it("checks for type existence", () => {
        // @ts-expect-error Allow testing invalid types.
        const invalidTransaction = new Transaction({...validTransaction, type: ""});
        expect(() => invalidTransaction.validate()).toThrow("type");
    });

    it("checks for valid type", () => {
        // @ts-expect-error Allow testing invalid types.
        const invalidTransaction = new Transaction({...validTransaction, type: "test"});
        expect(() => invalidTransaction.validate()).toThrow("type");
    });

    describe("amount validity", () => {
        it("rejects amounts that are null", () => {
            const invalidTransaction = new Transaction({...validTransaction});

            // @ts-expect-error Allow testing invalid values.
            invalidTransaction.amount = null;

            expect(() => invalidTransaction.validate()).toThrow("amount");
        });

        it("rejects amounts that are undefined", () => {
            const invalidTransaction = new Transaction({...validTransaction});

            // @ts-expect-error Allow testing invalid values.
            invalidTransaction.amount = undefined;

            expect(() => invalidTransaction.validate()).toThrow("amount");
        });

        it("rejects amounts that are not numbers", () => {
            const invalidTransaction = new Transaction({...validTransaction});

            // @ts-expect-error Allow testing invalid values.
            invalidTransaction.amount = "test";

            expect(() => invalidTransaction.validate()).toThrow("amount");
        });

        it("rejects amount that are greater than the max allowed number", () => {
            const invalidTransaction = new Transaction({...validTransaction});
            invalidTransaction.amount = InputValidation.maxNumber + 1;

            expect(() => invalidTransaction.validate()).toThrow("amount");
        });

        it("rejects amounts that are less than 0", () => {
            const invalidTransaction = new Transaction({...validTransaction});
            invalidTransaction.amount = -100;

            expect(() => invalidTransaction.validate()).toThrow("negative");
        });
    });

    describe("account 1/2 ID validity", () => {
        it("checks for creditAccount ID existence", () => {
            const invalidTransaction = new Transaction({...validTransaction, creditAccountId: ""});
            expect(() => invalidTransaction.validate()).toThrow("account");
        });

        it("checks for debitAccount ID existence", () => {
            const invalidTransaction = new Transaction({...validTransaction, debitAccountId: ""});
            expect(() => invalidTransaction.validate()).toThrow("account");
        });

        it("checks that creditAccount and debitAccount aren't the same", () => {
            const invalidTransaction = new Transaction({
                ...validTransaction,
                creditAccountId: "2",
                debitAccountId: "2"
            });
            expect(() => invalidTransaction.validate()).toThrow("can't be the same");
        });
    });
});

describe("dateSortAsc", () => {
    const firstDate = "2019-01-01";
    const secondDate = "2019-01-02";

    const firstTransaction = new Transaction({date: firstDate, createdAt: `${firstDate} 12:00:00`});

    const secondTransaction = new Transaction({
        date: firstDate,
        createdAt: `${firstDate} 13:00:00`
    });

    const thirdTransaction = new Transaction({
        date: secondDate,
        createdAt: `${secondDate} 12:00:00`
    });

    const fourthTransaction = new Transaction({
        date: secondDate,
        createdAt: `${secondDate} 13:00:00`
    });

    const invalidDateTransaction = new Transaction({date: "", createdAt: `${secondDate} 14:00:00`});

    const scrambledTransactions = [
        secondTransaction,
        fourthTransaction,
        thirdTransaction,
        firstTransaction
    ];
    const sortedTransactions = [
        firstTransaction,
        secondTransaction,
        thirdTransaction,
        fourthTransaction
    ];

    const scrambledTransactionsWithInvalidDate = [...scrambledTransactions, invalidDateTransaction];
    const sortedTransactionsWithInvalidDate = [invalidDateTransaction, ...sortedTransactions];

    it("sorts the transactions first by 'date' and then by 'createdAt'", () => {
        expect(scrambledTransactions.sort(Transaction.dateSortAsc)).toEqual(sortedTransactions);
    });

    it("sorts any transactions with invalid dates to the top", () => {
        expect(scrambledTransactionsWithInvalidDate.sort(Transaction.dateSortAsc)).toEqual(
            sortedTransactionsWithInvalidDate
        );
    });

    it("sorts transactions by amount if the dates and createdAt dates are the same", () => {
        const firstDuplicate = new Transaction({...firstTransaction, amount: 100});
        const secondDuplicate = new Transaction({...firstTransaction, amount: 200});

        expect(Transaction.sort([firstDuplicate, secondDuplicate], "date", "asc")).toEqual([
            firstDuplicate,
            secondDuplicate
        ]);

        expect(Transaction.sort([firstDuplicate, secondDuplicate], "date", "desc")).toEqual([
            secondDuplicate,
            firstDuplicate
        ]);
    });

    it("sorts transactions by description if the dates, createdAt, and amount are the same", () => {
        const firstDuplicate = new Transaction({
            ...firstTransaction,
            amount: 100,
            description: "a"
        });

        const secondDuplicate = new Transaction({
            ...firstTransaction,
            amount: 100,
            description: "b"
        });

        expect(Transaction.sort([firstDuplicate, secondDuplicate], "date", "asc")).toEqual([
            firstDuplicate,
            secondDuplicate
        ]);

        expect(Transaction.sort([firstDuplicate, secondDuplicate], "date", "desc")).toEqual([
            secondDuplicate,
            firstDuplicate
        ]);
    });
});

describe("amountSortAsc", () => {
    it("sorts the transactions by 'amount'", () => {
        const lowestTransaction = new Transaction({amount: 100.0});
        const lowTransaction = new Transaction({amount: 200.0});
        const highTransaction = new Transaction({amount: 300.0});
        const highestTransaction = new Transaction({amount: 400.0});

        const scrambledTransactions = [
            highTransaction,
            lowestTransaction,
            lowTransaction,
            highestTransaction
        ];
        const sortedTransactions = [
            lowestTransaction,
            lowTransaction,
            highTransaction,
            highestTransaction
        ];

        expect(scrambledTransactions.sort(Transaction.amountSortAsc)).toEqual(sortedTransactions);
    });

    it("can sort the transactions even if the amounts are strings", () => {
        const lowestTransaction = new Transaction({amount: "100.00"});
        const lowTransaction = new Transaction({amount: "200.00"});
        const highTransaction = new Transaction({amount: "300.00"});
        const highestTransaction = new Transaction({amount: "400.00"});

        const scrambledTransactions = [
            highTransaction,
            lowestTransaction,
            lowTransaction,
            highestTransaction
        ];
        const sortedTransactions = [
            lowestTransaction,
            lowTransaction,
            highTransaction,
            highestTransaction
        ];

        expect(scrambledTransactions.sort(Transaction.amountSortAsc)).toEqual(sortedTransactions);
    });
});

describe("stringPropertySortAsc", () => {
    const lowestTransaction = new Transaction({
        description: "Alskdjfglsdg",
        type: Transaction.DEBT
    });

    const lowTransaction = new Transaction({
        description: "btugtjgnrunw",
        type: Transaction.EXPENSE
    });

    const highTransaction = new Transaction({
        description: "ceirgubwiego",
        type: Transaction.INCOME
    });

    const highestTransaction = new Transaction({
        description: "Derugbibeg0w4b",
        type: Transaction.TRANSFER
    });

    const scrambledTransactions = [
        highTransaction,
        lowestTransaction,
        lowTransaction,
        highestTransaction
    ];
    const sortedTransactions = [
        lowestTransaction,
        lowTransaction,
        highTransaction,
        highestTransaction
    ];

    it("can sort the transactions by description", () => {
        expect(
            scrambledTransactions.sort(Transaction.stringPropertySortAsc("description"))
        ).toEqual(sortedTransactions);
    });

    it("can sort the transactions by type", () => {
        expect(scrambledTransactions.sort(Transaction.stringPropertySortAsc("type"))).toEqual(
            sortedTransactions
        );
    });
});

describe("sort", () => {
    // Note: These transactions have a different sorting order for each property.
    // This way we can be sure that, when testing, the right property is being sorted on.
    const transaction1 = new Transaction({
        amount: 12345,
        date: "2020-01-01",
        description: "bacd",
        creditAccount: new Account({name: "bacd"}),
        debitAccount: new Account({name: "cbade"})
    });

    const transaction2 = new Transaction({
        amount: 21345,
        date: "2020-03-03",
        description: "abcd",
        creditAccount: new Account({name: "cbad"}),
        debitAccount: new Account({name: "abcde"})
    });

    const transaction3 = new Transaction({
        amount: 32145,
        date: "2020-02-02",
        description: "cbad",
        creditAccount: new Account({name: "abcd"}),
        debitAccount: new Account({name: "bacde"})
    });

    const transactions = [transaction2, transaction3, transaction1];

    const dateDesc = [transaction2, transaction3, transaction1];
    const descriptionDesc = [transaction3, transaction1, transaction2];
    const amountDesc = [transaction3, transaction2, transaction1];
    const fromDesc = [transaction2, transaction1, transaction3];
    const toDesc = [transaction1, transaction3, transaction2];

    it("can sort by 'date' descending", () => {
        expect(Transaction.sort(transactions, "date", "desc")).toEqual(dateDesc);
    });

    it("can sort by 'date' ascending", () => {
        expect(Transaction.sort(transactions, "date", "asc")).toEqual([...dateDesc].reverse());
    });

    it("can sort by 'description' descending", () => {
        expect(Transaction.sort(transactions, "description", "desc")).toEqual(descriptionDesc);
    });

    it("can sort by 'description' ascending", () => {
        expect(Transaction.sort(transactions, "description", "asc")).toEqual(
            [...descriptionDesc].reverse()
        );
    });

    it("can sort by 'amount' descending", () => {
        expect(Transaction.sort(transactions, "amount", "desc")).toEqual(amountDesc);
    });

    it("can sort by 'amount' ascending", () => {
        expect(Transaction.sort(transactions, "amount", "asc")).toEqual([...amountDesc].reverse());
    });

    it("can sort by 'from' descending", () => {
        expect(Transaction.sort(transactions, "from", "desc")).toEqual(fromDesc);
    });

    it("can sort by 'from' ascending", () => {
        expect(Transaction.sort(transactions, "from", "asc")).toEqual([...fromDesc].reverse());
    });

    it("can sort by 'to' descending", () => {
        expect(Transaction.sort(transactions, "to", "desc")).toEqual(toDesc);
    });

    it("can sort by 'to' ascending", () => {
        expect(Transaction.sort(transactions, "to", "asc")).toEqual([...toDesc].reverse());
    });
});

describe("determineAccountFlow", () => {
    const creditAccount = "creditAccount";
    const debitAccount = "debitAccount";

    const partiallyAppliedFunc = (type: TransactionType) =>
        Transaction.determineAccountFlow(type, creditAccount, debitAccount);

    it("works for income transactions", () => {
        expect(partiallyAppliedFunc(Transaction.INCOME)).toEqual({
            leftAccount: creditAccount,
            rightAccount: debitAccount
        });
    });

    it("works for expense transactions", () => {
        expect(partiallyAppliedFunc(Transaction.EXPENSE)).toEqual({
            leftAccount: creditAccount,
            rightAccount: debitAccount
        });
    });

    it("works for debt transactions", () => {
        expect(partiallyAppliedFunc(Transaction.DEBT)).toEqual({
            leftAccount: creditAccount,
            rightAccount: debitAccount
        });
    });

    it("works for transfer transactions", () => {
        expect(partiallyAppliedFunc(Transaction.TRANSFER)).toEqual({
            leftAccount: creditAccount,
            rightAccount: debitAccount
        });
    });

    it("gives a default for unknown types", () => {
        // @ts-expect-error Allow testing invalid types.
        expect(partiallyAppliedFunc("whatever")).toEqual({
            leftAccount: creditAccount,
            rightAccount: debitAccount
        });
    });
});

describe("determineAccountTypes", () => {
    it("maps income transactions to account types", () => {
        expect(Transaction.determineAccountTypes(Transaction.INCOME)).toEqual({
            creditAccountTypes: [Account.INCOME],
            debitAccountTypes: [Account.ASSET]
        });
    });

    it("maps expense transactions to account types", () => {
        expect(Transaction.determineAccountTypes(Transaction.EXPENSE)).toEqual({
            creditAccountTypes: [Account.ASSET],
            debitAccountTypes: [Account.EXPENSE]
        });
    });

    it("maps debt transactions to account types", () => {
        expect(Transaction.determineAccountTypes(Transaction.DEBT)).toEqual({
            creditAccountTypes: [Account.LIABILITY],
            debitAccountTypes: [Account.EXPENSE]
        });
    });

    it("maps transfer transactions to account types", () => {
        expect(Transaction.determineAccountTypes(Transaction.TRANSFER)).toEqual({
            creditAccountTypes: [Account.ASSET, Account.LIABILITY],
            debitAccountTypes: [Account.ASSET, Account.LIABILITY]
        });
    });

    it("maps invalid transaction types to emptiness", () => {
        // @ts-expect-error Allow testing invalid types.
        expect(Transaction.determineAccountTypes("whatever")).toEqual({
            creditAccountTypes: [],
            debitAccountTypes: []
        });
    });
});

describe("filterByAccountId", () => {
    const account = new Account();

    const match1 = new Transaction({creditAccountId: account.id});
    const match2 = new Transaction({debitAccountId: account.id});

    const notMatch1 = new Transaction();
    const notMatch2 = new Transaction();

    const transactions = [match1, match2, notMatch1, notMatch2];

    it("can filter transactions by account ID", () => {
        expect(Transaction.filterByAccountId(transactions, account.id)).toEqual([match1, match2]);
    });
});

describe("populateTransaction", () => {
    const creditAccount = new Account({id: "1"});
    const debitAccount = new Account({id: "2"});

    const accountsById = {
        [creditAccount.id]: creditAccount,
        [debitAccount.id]: debitAccount
    };

    const transactionData: Partial<Transaction> = {
        id: "1",
        creditAccountId: creditAccount.id,
        debitAccountId: debitAccount.id
    };

    it("populates (merges) account data into a transaction's data", () => {
        const expectedTransaction = new Transaction({
            ...transactionData,
            creditAccount,
            debitAccount
        });

        expect(Transaction.populateTransaction(accountsById)(transactionData)).toEqual(
            expectedTransaction
        );
    });
});

describe("calculateAmountsByType", () => {
    const income1 = new Transaction({type: Transaction.INCOME, amount: 100});
    const income2 = new Transaction({type: Transaction.INCOME, amount: 100});

    const expense1 = new Transaction({type: Transaction.EXPENSE, amount: 100});

    const debt1 = new Transaction({type: Transaction.DEBT, amount: 100});
    const debt2 = new Transaction({type: Transaction.DEBT, amount: 100});
    const debt3 = new Transaction({type: Transaction.DEBT, amount: 100});

    const transfer1 = new Transaction({type: Transaction.TRANSFER, amount: 100});

    const transactions = [income1, income2, expense1, debt1, debt2, debt3, transfer1];

    it("can sum all the transactions by type", () => {
        expect(Transaction.calculateAmountsByType(transactions)).toEqual({
            [Transaction.INCOME]: 200,
            [Transaction.EXPENSE]: 100,
            [Transaction.DEBT]: 300,
            [Transaction.TRANSFER]: 100
        });
    });
});

describe("indexByDate", () => {
    const accountId = "123";

    const transaction1 = new Transaction({date: "2020-01-02"});
    const transaction2 = new Transaction({date: "2020-05-13", creditAccountId: accountId});
    const transaction3 = new Transaction({date: "2020-08-18", debitAccountId: accountId});
    const transaction4 = new Transaction({date: "2020-08-18", debitAccountId: accountId});

    const transactions = [transaction1, transaction2, transaction3, transaction4];

    it("can index transactions by date", () => {
        expect(Transaction.indexByDate(transactions)).toEqual({
            "2020-01-02": [transaction1],
            "2020-05-13": [transaction2],
            "2020-08-18": [transaction3, transaction4]
        });
    });

    it("can index the transactions by date while filtering by account ID", () => {
        expect(Transaction.indexByDate(transactions, accountId)).toEqual({
            "2020-05-13": [transaction2],
            "2020-08-18": [transaction3, transaction4]
        });
    });
});

describe("indexByRecurringTransaction", () => {
    const recurringId1 = "1";
    const recurringId2 = "2";

    const transaction1 = new Transaction({date: "2020-01-02"});

    const transaction2 = new Transaction({
        date: "2020-05-13",
        recurringTransactionId: recurringId2
    });

    const transaction3 = new Transaction({
        date: "2020-08-18",
        recurringTransactionId: recurringId1
    });

    const transaction4 = new Transaction({
        date: "2020-08-18",
        recurringTransactionId: recurringId2
    });

    const transactions = [transaction1, transaction2, transaction3, transaction4];

    it("can index transactions by recurring transaction", () => {
        expect(Transaction.indexByRecurringTransaction(transactions)).toEqual({
            [recurringId1]: {
                "2020-08-18": transaction3
            },
            [recurringId2]: {
                "2020-05-13": transaction2,
                "2020-08-18": transaction4
            }
        });
    });
});

describe("splitIncomeAndExpenses", () => {
    const income = [
        new Transaction({type: Transaction.INCOME}),
        new Transaction({type: Transaction.INCOME}),
        new Transaction({type: Transaction.INCOME}),
        new Transaction({type: Transaction.INCOME})
    ];

    const expenses = [
        new Transaction({type: Transaction.EXPENSE}),
        new Transaction({type: Transaction.EXPENSE}),
        new Transaction({type: Transaction.EXPENSE}),
        new Transaction({type: Transaction.EXPENSE})
    ];

    const transactions = [...income, ...expenses];

    it("puts income and expense transactions into separate lists", () => {
        expect(Transaction.splitIncomeAndExpenses(transactions)).toEqual({income, expenses});
    });
});

describe("isNewerTransaction", () => {
    const newerTransaction = new Transaction({date: "2019"});
    const olderTransaction = new Transaction({date: "2018"});

    it("can find that the first transaction is newer than the second", () => {
        expect(Transaction.isNewerTransaction(newerTransaction, olderTransaction)).toBe(true);
    });

    it("can find that the second transaction is newer than the second", () => {
        expect(Transaction.isNewerTransaction(olderTransaction, newerTransaction)).toBe(false);
    });
});

describe("isFutureTransaction", () => {
    const today = DateService.getTodayDate();

    it("returns true when the transaction's date is in the future (past and not including today)", () => {
        const transaction = new Transaction({date: DateService.addDays(today, 1)});
        expect(Transaction.isFutureTransaction(transaction)).toBe(true);
    });

    it("returns false when the transaction's date is today or in the past", () => {
        const transaction = new Transaction({date: today});
        expect(Transaction.isFutureTransaction(transaction)).toBe(false);

        const transaction2 = new Transaction({date: DateService.subtractDays(today, 1)});
        expect(Transaction.isFutureTransaction(transaction2)).toBe(false);
    });

    it("returns false when the transaction's date is invalid", () => {
        const transaction = new Transaction();
        transaction.date = "";

        expect(Transaction.isFutureTransaction(transaction)).toBe(false);
    });
});

describe("isVirtualTransaction", () => {
    it("returns true when the transaction is marked as a virtual transaction", () => {
        const transaction = new Transaction({
            isVirtual: true
        });

        expect(Transaction.isVirtualTransaction(transaction)).toBe(true);
    });

    // Note: This isn't actually a use case; just an edge case test.
    it("returns false when the transaction is explicitly marked as not virtual transaction", () => {
        const transaction = new Transaction({
            isVirtual: false
        });

        expect(Transaction.isVirtualTransaction(transaction)).toBe(false);
    });
});
