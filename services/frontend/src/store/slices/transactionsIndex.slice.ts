import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {createCachedSelector} from "re-reselect";
import {TransactionData} from "models/";
import {SearchService} from "services/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";
import deepCopy from "utils/deepCopy";
import {Id} from "utils/types";

/* State */

type Bigram = string;
type Word = string;

interface TransactionIndexRecord {
    bigram: Bigram;
    words: Array<Word>;
}

export interface TransactionsIndexSliceState {
    byBigram: Record<Bigram, Record<Id, Id>>;
    byWord: Record<Word, Record<Id, Id>>;
    byWordBigram: Record<Bigram, Record<Word, Word>>;
    byId: Record<Id, TransactionIndexRecord>;
}

export const initialState: TransactionsIndexSliceState = {
    byBigram: {},
    byWord: {},
    byWordBigram: {},
    byId: {}
};

/* Selectors */

const selectState = (state: State): TransactionsIndexSliceState => state[mounts.transactionsIndex];

const selectBigramIndex = createSelector([selectState], (state) => state.byBigram);
const selectWordIndex = createSelector([selectState], (state) => state.byWord);
const selectWordBigramIndex = createSelector([selectState], (state) => state.byWordBigram);

const searchBigrams = createCachedSelector(
    [selectBigramIndex, (_: State, query: string) => query],
    (bigramIndex, query) => SearchService.searchBigrams(query, bigramIndex)
)((_, query) => query);

const searchWords = createCachedSelector(
    [selectWordIndex, selectWordBigramIndex, (_: State, query: string) => query],
    (wordIndex, wordBigramIndex, query) =>
        SearchService.searchWords(query, wordIndex, wordBigramIndex)
)((_, query) => query);

const selectors = {
    selectTransactionsIndex: selectState,
    selectBigramIndex,
    selectWordBigramIndex,
    selectWordIndex,
    searchBigrams,
    searchWords
};

/* Slice Helper Functions */

const addTransaction = (
    state: TransactionsIndexSliceState,
    action: PayloadAction<TransactionData>
) => {
    // Expects a Transaction object as payload
    const {payload: transaction} = action;

    const {id, description} = transaction;

    addToBigram(state, description, id);
    addToWords(state, description, id);
    addToId(state, description, id);
};

const addTransactions = (
    state: TransactionsIndexSliceState,
    action: PayloadAction<Array<TransactionData>>
) => {
    // Expects a set of Transaction objects as payload
    const {payload: transactions} = action;
    transactions.forEach((transaction) => addTransaction(state, {type: "", payload: transaction}));
};

/* Slice */

export const transactionsIndexSlice = createSliceWithSelectors({
    name: mounts.transactionsIndex,
    initialState,
    reducers: {
        addTransaction,
        addTransactions,
        setTransactions: (
            _state: TransactionsIndexSliceState,
            action: PayloadAction<Record<Id, TransactionData>>
        ): TransactionsIndexSliceState => {
            // Expects an object of Transactions indexed by ID
            const {payload: transactionsById} = action;

            // Deep copy initialState to reset the state.
            // Can't use a shallow copy (like a spread) since the
            // underlying objects of initialState will still be the same --
            // bad since then the original initialState gets modified.
            const newState = deepCopy(initialState);

            // Add the transactions
            addTransactions(newState, {type: "", payload: Object.values(transactionsById)});
            return newState;
        },
        deleteTransaction: (state: TransactionsIndexSliceState, action: PayloadAction<Id>) => {
            // Expects a Transaction ID as payload
            const {payload: id} = action;

            // Don't do anything if the transaction doesn't exist
            if (!(id in state.byId)) {
                return state;
            }

            const {bigram, words} = state.byId[id];

            deleteFromId(state, id);
            deleteFromBigram(state, bigram, id);
            deleteFromWords(state, words, id);
        },
        updateTransaction: (
            state: TransactionsIndexSliceState,
            action: PayloadAction<TransactionData>
        ) => {
            // Expects a Transaction object as payload
            const {payload: transaction} = action;
            const {id, description} = transaction;

            if (!(id in state.byId)) {
                return state;
            }

            const {bigram: oldBigram, words: oldWords} = state.byId[id];

            // Remove transaction from old bigram/words
            deleteFromBigram(state, oldBigram, id);
            deleteFromWords(state, oldWords, id);

            // Update transaction's bigram/words and add new bigram/word
            addToId(state, description, id);
            addToBigram(state, description, id);
            addToWords(state, description, id);
        }
    },
    selectors
});

/* Helper Functions */

const addToBigram = (state: TransactionsIndexSliceState, description: string, id: Id) =>
    addToBigramIndex(state, "byBigram", description, id);

const addToWords = (state: TransactionsIndexSliceState, description: string, id: Id) => {
    const words = SearchService.generateWords(description);

    words.forEach((word) => {
        if (!(word in state.byWord)) {
            state.byWord[word] = {};
        }

        state.byWord[word][id] = id;

        addToWordBigram(state, word);
    });
};

const addToWordBigram = (state: TransactionsIndexSliceState, word: Word) =>
    addToBigramIndex(state, "byWordBigram", word, word);

const addToId = (state: TransactionsIndexSliceState, description: string, id: Id) => {
    const bigram = SearchService.generateBigram(description);
    const words = SearchService.generateWords(description);

    state.byId[id] = {
        bigram,
        words
    };
};

const deleteFromBigram = (state: TransactionsIndexSliceState, bigram: string, id: Id) =>
    deleteFromBigramIndex(state, "byBigram", bigram, id);

const deleteFromWords = (
    state: TransactionsIndexSliceState,
    words: Array<Word> = [],
    id: string
) => {
    words.forEach((word) => {
        // Need to optionally access things when deleting to make sure we don't accidentally have
        // undefined words/ids showing and blowing things up. When can this happen? Uhh... rarely.
        // Only way to trigger it right now is when deleting the Credit Card account from my personal
        // production user account -- i.e. an account with _lots_ of transactions. Like, 100+ transactions.
        delete state.byWord?.[word]?.[id];

        // Remove the word if it has no other transactions
        if (Object.keys(state.byWord?.[word] || {}).length === 0) {
            delete state.byWord?.[word];
            deleteFromWordBigram(state, word);
        }
    });
};

const deleteFromWordBigram = (state: TransactionsIndexSliceState, word: Word) =>
    deleteFromBigramIndex(state, "byWordBigram", SearchService.generateBigram(word), word);

const deleteFromId = (state: TransactionsIndexSliceState, id: Id) => {
    delete state.byId[id];
};

const addToBigramIndex = (
    state: TransactionsIndexSliceState,
    bigramIndex: "byBigram" | "byWordBigram" = "byBigram",
    indexString: string = "",
    resourceString: string = ""
) => {
    const bigram = SearchService.generateBigram(indexString);

    if (!(bigram in state[bigramIndex])) {
        state[bigramIndex][bigram] = {};
    }

    state[bigramIndex][bigram][resourceString] = resourceString;
};

const deleteFromBigramIndex = (
    state: TransactionsIndexSliceState,
    bigramIndex: "byBigram" | "byWordBigram" = "byBigram",
    bigram: string = "",
    resourceString: string = ""
) => {
    delete state[bigramIndex]?.[bigram]?.[resourceString];

    // Remove the bigram if it has no other resources
    if (Object.keys(state[bigramIndex]?.[bigram] || {}).length === 0) {
        delete state[bigramIndex]?.[bigram];
    }
};
