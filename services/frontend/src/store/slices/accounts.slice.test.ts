import {Account, Transaction} from "models/";
import {accountsSlice} from "./accounts.slice";

describe("accounts reducer", () => {
    const {reducer, actions} = accountsSlice;

    const creditAccount = new Account({name: "creditAccount"});
    const debitAccount = new Account({name: "debitAccount"});

    const transaction1 = new Transaction({
        creditAccountId: creditAccount.id,
        debitAccountId: debitAccount.id
    });
    const transaction2 = new Transaction({
        creditAccountId: creditAccount.id,
        debitAccountId: debitAccount.id
    });

    const accounts = {[creditAccount.id]: creditAccount, [debitAccount.id]: debitAccount};
    const transactions = [transaction1, transaction2];

    const accountsWithTransaction = {
        [creditAccount.id]: new Account({...creditAccount, transactionIds: [transaction1.id]}),
        [debitAccount.id]: new Account({...debitAccount, transactionIds: [transaction1.id]})
    };

    const accountsWithAllTransactions = {
        [creditAccount.id]: new Account({
            ...creditAccount,
            transactionIds: [transaction1.id, transaction2.id]
        }),
        [debitAccount.id]: new Account({
            ...debitAccount,
            transactionIds: [transaction1.id, transaction2.id]
        })
    };

    it("can set accounts", () => {
        expect(reducer(undefined, actions.set(accounts))).toEqual(accounts);
    });

    it("can add an account", () => {
        expect(reducer(undefined, actions.add(creditAccount))).toEqual({
            [creditAccount.id]: creditAccount
        });
    });

    it("can add a transaction to two accounts", () => {
        expect(reducer(accounts, actions.addTransactionToAccounts(transaction1))).toEqual(
            accountsWithTransaction
        );
    });

    it("doesn't add a transaction if it already exists", () => {
        expect(
            reducer(accountsWithTransaction, actions.addTransactionToAccounts(transaction1))
        ).toEqual(accountsWithTransaction);
    });

    it("can add a set of transactions", () => {
        expect(reducer(accounts, actions.addTransactionsToAccounts(transactions))).toEqual(
            accountsWithAllTransactions
        );
    });

    it("doesn't add multiple transactions if they already exist", () => {
        expect(
            reducer(accountsWithAllTransactions, actions.addTransactionsToAccounts(transactions))
        ).toEqual(accountsWithAllTransactions);
    });

    it("can remove a transaction from two accounts", () => {
        expect(
            reducer(accountsWithTransaction, actions.removeTransactionFromAccounts(transaction1))
        ).toEqual(accounts);
    });

    it("doesn't do anything if the transaction doesn't exist", () => {
        expect(reducer(accounts, actions.removeTransactionFromAccounts(transaction1))).toEqual(
            accounts
        );
    });
});
