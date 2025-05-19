import {push} from "connected-react-router";
import {select} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {Matcher} from "redux-saga-test-plan/matchers";
import {Account, ImportProfile, ImportableTransaction, Transaction, ImportRule} from "models/";
import {
    accountsSlice,
    crossSliceSelectors,
    importProfilesRequestsSlice,
    importRulesSlice,
    importRulesRequestsSlice,
    toastsSlice,
    transactionsImportSlice,
    transactionsRequestsSlice,
    transactionsSlice
} from "store/";
import {actionWithDummyType, silenceConsoleErrors} from "utils/testHelpers";
import ScreenUrls from "values/screenUrls";
import {STEP_INDICES} from "values/transactionsImportSteps";
import * as sagas from "./transactionsImport.sagas";

// Pull out the helper functions as separate 'imports'
const {applyRules, cleanTransactions, markDuplicates} = sagas;

describe("parseFile saga", () => {
    it("can successfully parse a CSV file and store the results", () => {
        const fileName = "name";
        const file = new File(["1,2,3\n", "1,2"], fileName);

        const parserResults = [
            ["1", "2", "3"],
            ["1", "2"]
        ];

        return expectSaga(sagas.parseFile, actionWithDummyType(file))
            .put(transactionsImportSlice.actions.setFileName(fileName))
            .put(transactionsImportSlice.actions.setFileContents(parserResults))
            .run();
    });

    it("can show a toast if the CSV parser encounters any errors", () => {
        return expectSaga(sagas.parseFile, actionWithDummyType(""))
            .not.put.actionType(transactionsImportSlice.actions.setFileName.type)
            .not.put.actionType(transactionsImportSlice.actions.setFileContents.type)
            .put.actionType(toastsSlice.actions.add.type)
            .run();
    });
});

describe("createImportProfile saga", () => {
    const profileName = "new name";

    const providers: Matcher = [
        [select(transactionsImportSlice.selectors.selectNewImportProfileName), profileName],
        [select(transactionsImportSlice.selectors.selectNewImportProfileFields), []]
    ];

    it("can create a profile on the backend and wait for success before adding it to the store", () => {
        return expectSaga(sagas.createImportProfile)
            .provide(providers)
            .put.like({
                action: {
                    type: importProfilesRequestsSlice.create.actions.request.type,
                    payload: {name: profileName}
                }
            })
            .put.actionType(transactionsImportSlice.actions.setImportProfileId.type)
            .dispatch(importProfilesRequestsSlice.create.actions.success())
            .run();
    });

    it("starts the transition to the Adjust Transactions step once the profile is created", () => {
        return expectSaga(sagas.createImportProfile)
            .provide(providers)
            .put(transactionsImportSlice.actions.startMoveToAdjustTransactionsStep())
            .dispatch(importProfilesRequestsSlice.create.actions.success())
            .run();
    });
});

describe("parseCsvIntoTransactions saga", () => {
    it("can parses the CSV and then move to the Adjust Transactions step", () => {
        const dummyResults = {};

        return (
            expectSaga(sagas.parseCsvIntoTransactions)
                // Mock all the selects to mock store state
                .provide([
                    [select(transactionsImportSlice.selectors.selectFileContents), [[]]],
                    [
                        select(crossSliceSelectors.transactionsImport.selectProfile),
                        new ImportProfile()
                    ],
                    [select(crossSliceSelectors.transactionsImport.selectAccount), new Account()],
                    [select(transactionsSlice.selectors.selectTransactions), {}],
                    [select(crossSliceSelectors.importRules.selectImportRules), []],
                    [select(accountsSlice.selectors.selectAccounts), {}],
                    {call: () => []}
                ])
                .put(transactionsImportSlice.actions.setTransactions(dummyResults))
                .put(transactionsImportSlice.actions.finishMoveToAdjustTransactionsStep())
                // Need a longer timeout to account for the delays.
                .run(1500)
        );
    });
});

describe("reapplyRulesWhenChanged", () => {
    const rule = new ImportRule();
    const action = {payload: rule, type: ""};

    const transaction = new ImportableTransaction();

    const transactions = {
        [transaction.id]: transaction
    };

    it("doesn't do anything if not on the Adjust Transactions step", () => {
        return expectSaga(sagas.reapplyRulesWhenChanged, action)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.CHOOSE_FILE
                ]
            ])
            .dispatch(importRulesRequestsSlice.create.actions.success)
            .not.call.fn(applyRules)
            .run();
    });

    it("waits for a rule create request to finish before reapplying rules", () => {
        return expectSaga(sagas.reapplyRulesWhenChanged, action)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ],
                [select(transactionsImportSlice.selectors.selectRawTransactions), transactions],
                {call: () => []}
            ])
            .dispatch(importRulesRequestsSlice.create.actions.success)
            .call(applyRules, Object.values(transactions))
            .run();
    });

    it("waits for a rule update request to finish before reapplying rules", () => {
        return expectSaga(sagas.reapplyRulesWhenChanged, action)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ],
                [select(transactionsImportSlice.selectors.selectRawTransactions), transactions],
                {call: () => []}
            ])
            .dispatch(importRulesRequestsSlice.update.actions.success)
            .call(applyRules, Object.values(transactions))
            .run();
    });

    it("doesn't do anything if the rule create request fails", () => {
        return expectSaga(sagas.reapplyRulesWhenChanged, action)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ]
            ])
            .dispatch(importRulesRequestsSlice.create.actions.failure)
            .not.call.fn(applyRules)
            .run();
    });

    it("doesn't do anything if the rule update request fails", () => {
        return expectSaga(sagas.reapplyRulesWhenChanged, action)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ]
            ])
            .dispatch(importRulesRequestsSlice.update.actions.failure)
            .not.call.fn(applyRules)
            .run();
    });

    it("emits a toast when the created rule isn't an active rule", () => {
        const createAction = {...action, type: importRulesSlice.actions.add.type};

        return expectSaga(sagas.reapplyRulesWhenChanged, createAction)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ],
                [select(transactionsImportSlice.selectors.selectRawTransactions), transactions],
                {call: () => []}
            ])
            .dispatch(importRulesRequestsSlice.create.actions.success)
            .call(applyRules, Object.values(transactions))
            .put.actionType(toastsSlice.actions.add.type)
            .run();
    });

    it("doesn't emit a toast when the updated rule isn't an active rule", () => {
        const createAction = {...action, type: importRulesSlice.actions.update.type};

        return expectSaga(sagas.reapplyRulesWhenChanged, createAction)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.ADJUST_TRANSACTIONS
                ],
                [select(transactionsImportSlice.selectors.selectRawTransactions), transactions],
                {call: () => []}
            ])
            .dispatch(importRulesRequestsSlice.update.actions.success)
            .call(applyRules, Object.values(transactions))
            .not.put.actionType(toastsSlice.actions.add.type)
            .run();
    });
});

describe("cleanTransactionsForSummary saga", () => {
    it("only cleans when entering the Complete Import step", () => {
        const dummyResults = {};

        return (
            expectSaga(sagas.cleanTransactionsForSummary)
                // Mock all the selects to mock store state
                .provide([
                    [
                        select(transactionsImportSlice.selectors.selectCurrentStep),
                        STEP_INDICES.COMPLETE_IMPORT
                    ],
                    [select(crossSliceSelectors.transactionsImport.selectAccount), new Account()],
                    [select(transactionsImportSlice.selectors.selectAllTransactions), {}],
                    [matchers.call.fn(cleanTransactions), dummyResults]
                ])
                .put(transactionsImportSlice.actions.setCleanTransactions(dummyResults))
                .run()
        );
    });

    it("doesn't do anything when not entering the Complete Import step", () => {
        return expectSaga(sagas.cleanTransactionsForSummary)
            .provide([
                [
                    select(transactionsImportSlice.selectors.selectCurrentStep),
                    STEP_INDICES.CHOOSE_ACCOUNT
                ]
            ])
            .not.put.actionType(transactionsImportSlice.actions.setCleanTransactions.type)
            .run();
    });
});

describe("importTransactions", () => {
    const transactions = [new ImportableTransaction()];

    const mockProviders: Matcher = [{select: () => transactions}];

    it("can create the transactions on the backend", () => {
        return (
            expectSaga(sagas.importTransactions)
                .provide(mockProviders)
                .put(transactionsRequestsSlice.createMany.actions.request(transactions))
                // Need to dispatch success so that the saga doesn't time out in the race
                .dispatch(transactionsRequestsSlice.createMany.actions.success())
                .run()
        );
    });

    it("send a success toast when all the transactions have been imported", () => {
        return expectSaga(sagas.importTransactions)
            .provide(mockProviders)
            .put.actionType(toastsSlice.actions.add.type)
            .dispatch(transactionsRequestsSlice.createMany.actions.success())
            .run();
    });

    it("can navigate the user back to the home page after import success", () => {
        return expectSaga(sagas.importTransactions)
            .provide(mockProviders)
            .put(push(ScreenUrls.APP))
            .dispatch(transactionsRequestsSlice.createMany.actions.success())
            .run();
    });

    it("resets the transactionsImport slice back to initial state after import success", () => {
        return expectSaga(sagas.importTransactions)
            .provide(mockProviders)
            .put(transactionsImportSlice.actions.resetState())
            .dispatch(transactionsRequestsSlice.createMany.actions.success())
            .run();
    });

    it("can send an error toast and throw an error when a failing to create a transaction", async () => {
        silenceConsoleErrors();

        await expectSaga(sagas.importTransactions)
            .provide(mockProviders)
            .put.actionType(toastsSlice.actions.add.type)
            .throws(new Error("Failed to import transactions: error"))
            .dispatch(transactionsRequestsSlice.createMany.actions.failure({message: "error"}))
            .run();
    });
});

describe("cleanTransactions helper", () => {
    const account = new Account();
    const account2 = new Account();

    const rawTransaction = new ImportableTransaction({
        creditAccountId: account.id,
        debitAccountId: account2.id,
        amount: 12345,
        type: Transaction.INCOME
    });

    const rawTransferTransaction = new ImportableTransaction({
        creditAccountId: account.id,
        debitAccountId: account2.id,
        amount: 6789,
        type: Transaction.TRANSFER
    });

    const transactions = {
        [rawTransaction.id]: rawTransaction,
        [rawTransferTransaction.id]: rawTransferTransaction
    };

    it("converts the ImportableTransactions into regular Transactions", () => {
        const results = cleanTransactions(transactions);

        expect("includeInImport" in results[rawTransaction.id]).toBe(false);
        expect("includeInImport" in results[rawTransferTransaction.id]).toBe(false);
    });

    it("removes any transactions that have been marked to not be imported", () => {
        const excludedTransaction = new ImportableTransaction({includeInImport: false});

        const transactionsWithExcluded = {
            ...transactions,
            [excludedTransaction.id]: excludedTransaction
        };

        const results = cleanTransactions(transactionsWithExcluded);
        expect(excludedTransaction.id in results).toBe(false);
    });

    it("doesn't touch the amounts (because they should already be in cents)", () => {
        const results = cleanTransactions(transactions);

        expect(results[rawTransaction.id].amount).toBe(12345);
        expect(results[rawTransferTransaction.id].amount).toBe(6789);
    });
});

describe("markDuplicates", () => {
    const expectDuplicate = (transaction: ImportableTransaction) => {
        expect(transaction.isDuplicate).toBe(true);
        expect(transaction.includeInImport).toBe(false);
    };

    const expectNotDuplicate = (transaction: ImportableTransaction) => {
        expect(transaction.isDuplicate).toBe(false);
        expect(transaction.includeInImport).toBe(true);
    };

    it("marks new transactions as duplicates if they have the same date and amount as existing transactions", () => {
        const newTransactionDuplicate = new ImportableTransaction({
            date: "2019-01-01",
            amount: 1000
        });

        const newTransactionNonDuplicate = new ImportableTransaction({
            date: "2019-01-02",
            amount: 1000
        });

        const newTransactionNonDuplicate2 = new ImportableTransaction({
            date: "2019-01-01",
            amount: 1001
        });

        const newTransactions = [
            newTransactionDuplicate,
            newTransactionNonDuplicate,
            newTransactionNonDuplicate2
        ];

        const existingTransaction = new Transaction({date: "2019-01-01", amount: 1000});
        const existingTransactions = [existingTransaction];

        // Assert the starting conditions
        for (const transaction of newTransactions) {
            expectNotDuplicate(transaction);
        }

        // Run function and make sure it doesn't actually return anything
        const result = markDuplicates(newTransactions, existingTransactions);
        expect(result).toBe(undefined);

        // Assert the final conditions
        expectDuplicate(newTransactionDuplicate);
        expectNotDuplicate(newTransactionNonDuplicate);
        expectNotDuplicate(newTransactionNonDuplicate2);
    });

    it("can handle new transactions that have formatted string values as amounts instead of cents", () => {
        const newTransactions = [new ImportableTransaction({date: "2019-01-01", amount: 1000})];
        const existingTransactions = [new Transaction({date: "2019-01-01", amount: 1000})];

        markDuplicates(newTransactions, existingTransactions);
        expectDuplicate(newTransactions[0]);
    });

    it("ignores the transaction's type, description, and accounts when checking for duplicates", () => {
        const newTransactions = [
            new ImportableTransaction({
                date: "2019-01-02",
                amount: 1001,
                description: "test",
                type: Transaction.INCOME,
                creditAccountId: "1",
                debitAccountId: "2"
            })
        ];

        const existingTransactions = [
            new Transaction({...newTransactions[0], date: "2019-01-01", amount: 1000})
        ];

        markDuplicates(newTransactions, existingTransactions);
        expectNotDuplicate(newTransactions[0]);
    });

    it("converts any negative amounts to positives for the purposes of duplication checking", () => {
        const newTransactions = [new ImportableTransaction({date: "2019-01-01", amount: -1000})];
        const existingTransactions = [new Transaction({date: "2019-01-01", amount: 1000})];

        markDuplicates(newTransactions, existingTransactions);
        expectDuplicate(newTransactions[0]);
    });
});

describe("applyRules", () => {
    const activeRuleIds = ["1"];
    const transaction = new ImportableTransaction();

    const transactions = {
        [transaction.id]: transaction
    };

    it("applies the rules to store the active rules and applied transactions", () => {
        return expectSaga(applyRules, Object.values(transactions))
            .provide([
                // Just mock out the selects, since the call gets mocked anyways.
                {select: () => {}},
                {call: () => ({activeRuleIds, transactions})}
            ])
            .put(transactionsImportSlice.actions.setActiveRuleIds(activeRuleIds))
            .put(transactionsImportSlice.actions.setTransactionsFromRules(transactions))
            .run();
    });

    it("emits a toast if any errors are encountered", () => {
        return expectSaga(applyRules, Object.values(transactions))
            .provide([
                // Just mock out the selects, since the call gets mocked anyways.
                {select: () => {}},
                {
                    call: () => {
                        throw new Error("test");
                    }
                }
            ])
            .not.put(transactionsImportSlice.actions.setActiveRuleIds(activeRuleIds))
            .put.actionType(toastsSlice.actions.add.type)
            .put(transactionsImportSlice.actions.setTransactionsFromRules(transactions))
            .run();
    });
});
