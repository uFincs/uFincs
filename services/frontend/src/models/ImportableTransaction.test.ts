import Account from "./Account";
import ImportableTransaction from "./ImportableTransaction";
import Transaction, {TransactionType} from "./Transaction";

describe("determineTransactionType", () => {
    describe("Importing to Asset Account", () => {
        const assetAccount = new Account({type: Account.ASSET});

        it("sets the type to Income when the amount is positive", () => {
            const transaction = new ImportableTransaction();

            transaction.amount = 100;
            transaction.determineTransactionType(assetAccount);

            expect(transaction.type).toBe(Transaction.INCOME);
        });

        it("sets the type to Expense when the amount is negative", () => {
            const transaction = new ImportableTransaction();

            transaction.amount = -100;
            transaction.determineTransactionType(assetAccount);

            expect(transaction.type).toBe(Transaction.EXPENSE);
        });
    });

    describe("Importing to Liability Account", () => {
        const liabilityAccount = new Account({type: Account.LIABILITY});

        it("sets the type to Debt when the amount is positive", () => {
            const transaction = new ImportableTransaction();

            transaction.amount = 100;
            transaction.determineTransactionType(liabilityAccount);

            expect(transaction.type).toBe(Transaction.DEBT);
        });

        it("sets the type to Transfer when the amount is negative", () => {
            const transaction = new ImportableTransaction();

            transaction.amount = -100;
            transaction.determineTransactionType(liabilityAccount);

            expect(transaction.type).toBe(Transaction.TRANSFER);
        });
    });

    describe("Importing to non Asset/Liability Account", () => {
        it("sets the type to Income when the account isn't an asset or liability", () => {
            const transaction = new ImportableTransaction();

            transaction.amount = 100;

            transaction.determineTransactionType(new Account({type: Account.INCOME}));
            expect(transaction.type).toBe(Transaction.INCOME);

            transaction.determineTransactionType(new Account({type: Account.EXPENSE}));
            expect(transaction.type).toBe(Transaction.INCOME);

            transaction.amount = -100;

            transaction.determineTransactionType(new Account({type: Account.INCOME}));
            expect(transaction.type).toBe(Transaction.INCOME);

            transaction.determineTransactionType(new Account({type: Account.EXPENSE}));
            expect(transaction.type).toBe(Transaction.INCOME);
        });
    });
});

describe("determineTargetTransactionSides", () => {
    it("maps income transactions to transaction sides", () => {
        expect(ImportableTransaction.determineTargetTransactionSides(Transaction.INCOME)).toEqual({
            targetAccount: "credit",
            importAccount: "debit"
        });
    });

    it("maps expense transactions to transaction sides", () => {
        expect(ImportableTransaction.determineTargetTransactionSides(Transaction.EXPENSE)).toEqual({
            targetAccount: "debit",
            importAccount: "credit"
        });
    });

    it("maps debt transactions to transaction sides", () => {
        expect(ImportableTransaction.determineTargetTransactionSides(Transaction.DEBT)).toEqual({
            targetAccount: "debit",
            importAccount: "credit"
        });
    });

    it("maps transfer transactions to transaction sides", () => {
        expect(ImportableTransaction.determineTargetTransactionSides(Transaction.TRANSFER)).toEqual(
            {
                targetAccount: "debit",
                importAccount: "credit"
            }
        );
    });
});

describe("swapAccountsForNewType", () => {
    const credit = "1";
    const debit = "2";

    const swapAccountsThatReturns = (
        transaction: ImportableTransaction,
        newType: TransactionType
    ) => {
        const copy = new ImportableTransaction(transaction);

        ImportableTransaction.swapAccountsForNewType(copy, newType);

        return copy;
    };

    describe("Originally Income", () => {
        const transaction = new ImportableTransaction({
            type: Transaction.INCOME,
            creditAccountId: credit,
            debitAccountId: debit
        });

        it("can change to an expense", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.EXPENSE);

            expect(changed.creditAccountId).toBe(debit);
            expect(changed.debitAccountId).toBe("");
        });

        it("can change to a debt", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.DEBT);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe("");
        });

        it("can change to a transfer", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.TRANSFER);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe(debit);
        });
    });

    describe("Originally Expense", () => {
        const transaction = new ImportableTransaction({
            type: Transaction.EXPENSE,
            creditAccountId: credit,
            debitAccountId: debit
        });

        it("can change to an income", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.INCOME);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe(credit);
        });

        it("can change to a debt", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.DEBT);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe(debit);
        });

        it("can change to a transfer", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.TRANSFER);

            expect(changed.creditAccountId).toBe(credit);
            expect(changed.debitAccountId).toBe("");
        });
    });

    describe("Originally Debt", () => {
        const transaction = new ImportableTransaction({
            type: Transaction.DEBT,
            creditAccountId: credit,
            debitAccountId: debit
        });

        it("can change to an income", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.INCOME);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe("");
        });

        it("can change to a expense", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.EXPENSE);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe(debit);
        });

        it("can change to a transfer", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.TRANSFER);

            expect(changed.creditAccountId).toBe(credit);
            expect(changed.debitAccountId).toBe("");
        });
    });

    describe("Originally Transfer", () => {
        const transaction = new ImportableTransaction({
            type: Transaction.TRANSFER,
            creditAccountId: credit,
            debitAccountId: debit
        });

        it("can change to an income", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.INCOME);

            expect(changed.creditAccountId).toBe("");
            expect(changed.debitAccountId).toBe(debit);
        });

        it("can change to a expense", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.EXPENSE);

            expect(changed.creditAccountId).toBe(credit);
            expect(changed.debitAccountId).toBe("");
        });

        it("can change to a debt", () => {
            const changed = swapAccountsThatReturns(transaction, Transaction.DEBT);

            expect(changed.creditAccountId).toBe(credit);
            expect(changed.debitAccountId).toBe("");
        });
    });
});
