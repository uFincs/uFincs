import {Transaction} from "models/";
import mounts from "store/mountpoints";
import {
    initialState,
    transactionsIndexSlice,
    TransactionsIndexSliceState
} from "./transactionsIndex.slice";

const createNewState = (newState: Partial<TransactionsIndexSliceState>) => ({
    ...initialState,
    ...newState
});

describe("reducer", () => {
    const {actions, reducer} = transactionsIndexSlice;

    const description1 = "Testing bigrams";
    const description1Bigram = "te";
    const description1Words = ["test", "bigram"];

    const description2 = "Hello world!";
    const description2Bigram = "he";
    const description2Words = ["hello", "world"];

    const description3 = "Telling the world about bigrams";
    const description3Bigram = "te";
    const description3Words = ["tell", "world", "bigram"];

    const transaction1 = new Transaction({description: description1});
    const transaction2 = new Transaction({description: description2});
    const transaction3 = new Transaction({description: description3});

    const id1 = transaction1.id;
    const id2 = transaction2.id;
    const id3 = transaction3.id;

    const transactions = [transaction1, transaction2, transaction3];

    const transaction1State = createNewState({
        byId: {
            [id1]: {
                bigram: description1Bigram,
                words: description1Words
            }
        },
        byBigram: {
            [description1Bigram]: {[id1]: id1}
        },
        byWord: {
            test: {
                [id1]: id1
            },
            bigram: {
                [id1]: id1
            }
        },
        byWordBigram: {
            te: {
                test: "test"
            },
            bi: {
                bigram: "bigram"
            }
        }
    });

    const transaction1And2State = createNewState({
        byId: {
            [id1]: {
                bigram: description1Bigram,
                words: description1Words
            },
            [id2]: {
                bigram: description2Bigram,
                words: description2Words
            }
        },
        byBigram: {
            [description1Bigram]: {[id1]: id1},
            [description2Bigram]: {[id2]: id2}
        },
        byWord: {
            test: {
                [id1]: id1
            },
            bigram: {
                [id1]: id1
            },
            hello: {
                [id2]: id2
            },
            world: {
                [id2]: id2
            }
        },
        byWordBigram: {
            te: {
                test: "test"
            },
            bi: {
                bigram: "bigram"
            },
            he: {
                hello: "hello"
            },
            wo: {
                world: "world"
            }
        }
    });

    const allTransactionsState = createNewState({
        byId: {
            [id1]: {
                bigram: description1Bigram,
                words: description1Words
            },
            [id2]: {
                bigram: description2Bigram,
                words: description2Words
            },
            [id3]: {
                bigram: description3Bigram,
                words: description3Words
            }
        },
        byBigram: {
            [description1Bigram]: {[id1]: id1, [id3]: id3},
            [description2Bigram]: {[id2]: id2}
        },
        byWord: {
            test: {
                [id1]: id1
            },
            bigram: {
                [id1]: id1,
                [id3]: id3
            },
            hello: {
                [id2]: id2
            },
            world: {
                [id2]: id2,
                [id3]: id3
            },
            tell: {
                [id3]: id3
            }
        },
        byWordBigram: {
            te: {
                test: "test",
                tell: "tell"
            },
            bi: {
                bigram: "bigram"
            },
            he: {
                hello: "hello"
            },
            wo: {
                world: "world"
            }
        }
    });

    it("can add a new transaction to the index", () => {
        expect(reducer(initialState, actions.addTransaction(transaction1))).toEqual(
            transaction1State
        );

        expect(reducer(transaction1State, actions.addTransaction(transaction2))).toEqual(
            transaction1And2State
        );
    });

    it("doesn't change anything when adding an existing transaction", () => {
        expect(reducer(transaction1State, actions.addTransaction(transaction1))).toEqual(
            transaction1State
        );
    });

    it("can add a set of new transactions to the index", () => {
        expect(reducer(initialState, actions.addTransactions([transaction1]))).toEqual(
            transaction1State
        );

        expect(
            reducer(initialState, actions.addTransactions([transaction1, transaction2]))
        ).toEqual(transaction1And2State);

        expect(reducer(initialState, actions.addTransactions(transactions))).toEqual(
            allTransactionsState
        );
    });

    it("doesn't change anything when adding multiple existing transactions", () => {
        expect(reducer(transaction1State, actions.addTransactions([transaction1]))).toEqual(
            transaction1State
        );

        expect(reducer(allTransactionsState, actions.addTransactions(transactions))).toEqual(
            allTransactionsState
        );
    });

    it("can reset the index to only have a certain set of transactions", () => {
        expect(
            reducer(allTransactionsState, actions.setTransactions({[id1]: transaction1}))
        ).toEqual(transaction1State);
    });

    it("can delete a transaction from the index", () => {
        expect(reducer(transaction1And2State, actions.deleteTransaction(id2))).toEqual(
            transaction1State
        );

        expect(reducer(allTransactionsState, actions.deleteTransaction(id3))).toEqual(
            transaction1And2State
        );
    });

    it("removes the bigram when deleting its last transaction", () => {
        expect(reducer(transaction1State, actions.deleteTransaction(id1))).toEqual(initialState);
    });

    it("doesn't change anything when deleting a non existent transaction", () => {
        expect(reducer(initialState, actions.deleteTransaction(id1))).toEqual(initialState);

        expect(reducer(transaction1State, actions.deleteTransaction(id2))).toEqual(
            transaction1State
        );
    });

    it("can update a transaction in the index", () => {
        const updatedDescription1 = "new description";
        const updatedDescription1Bigram = "ne";
        const updatedDescription1Words = ["new", "descript"];

        const updatedTransaction1 = new Transaction({
            ...transaction1,
            description: updatedDescription1
        });

        const updatedTransaction1State = createNewState({
            byId: {
                [id1]: {
                    bigram: updatedDescription1Bigram,
                    words: updatedDescription1Words
                }
            },
            byBigram: {
                [updatedDescription1Bigram]: {[id1]: id1}
            },
            byWord: {
                new: {[id1]: id1},
                descript: {[id1]: id1}
            },
            byWordBigram: {
                ne: {new: "new"},
                de: {descript: "descript"}
            }
        });

        const updatedAllTransactionsState = createNewState({
            byId: {
                ...allTransactionsState.byId,
                [id1]: {
                    bigram: updatedDescription1Bigram,
                    words: updatedDescription1Words
                }
            },
            byBigram: {
                [updatedDescription1Bigram]: {[id1]: id1},
                [description2Bigram]: {[id2]: id2},
                [description3Bigram]: {[id3]: id3}
            },
            byWord: {
                new: {
                    [id1]: id1
                },
                descript: {
                    [id1]: id1
                },
                bigram: {
                    [id3]: id3
                },
                hello: {
                    [id2]: id2
                },
                world: {
                    [id2]: id2,
                    [id3]: id3
                },
                tell: {
                    [id3]: id3
                }
            },
            byWordBigram: {
                te: {tell: "tell"},
                bi: {bigram: "bigram"},
                he: {hello: "hello"},
                wo: {world: "world"},
                ne: {new: "new"},
                de: {descript: "descript"}
            }
        });

        expect(reducer(transaction1State, actions.updateTransaction(updatedTransaction1))).toEqual(
            updatedTransaction1State
        );

        expect(
            reducer(allTransactionsState, actions.updateTransaction(updatedTransaction1))
        ).toEqual(updatedAllTransactionsState);
    });

    it("doesn't do anything when trying to update a non existent transaction", () => {
        expect(reducer(initialState, actions.updateTransaction(transaction1))).toEqual(
            initialState
        );
    });
});

describe("selectors", () => {
    const {selectors} = transactionsIndexSlice;

    const createNewStoreState = (newState: Partial<TransactionsIndexSliceState>) => ({
        [mounts.transactionsIndex]: {
            ...initialState,
            ...newState
        }
    });

    const id = "id123";

    const bigramIndex = {te: {[id]: id}};
    const wordIndex = {word: {[id]: id}};
    const wordBigramIndex = {wo: {word: "word"}};

    describe("selectBigramIndex", () => {
        it("can get the bigrams index", () => {
            const state = createNewStoreState({byBigram: bigramIndex});
            expect(selectors.selectBigramIndex(state)).toEqual(bigramIndex);
        });
    });

    describe("selectWordIndex", () => {
        it("can get the word index", () => {
            const state = createNewStoreState({byWord: wordIndex});
            expect(selectors.selectWordIndex(state)).toEqual(wordIndex);
        });
    });

    describe("selectWordBigramIndex", () => {
        it("can get the word bigram index", () => {
            const state = createNewStoreState({byWordBigram: wordBigramIndex});
            expect(selectors.selectWordBigramIndex(state)).toEqual(wordBigramIndex);
        });
    });

    describe("searchBigrams", () => {
        it("can search bigrams given a query", () => {
            const state = createNewStoreState({byBigram: bigramIndex});
            expect(selectors.searchBigrams(state, "test")).toEqual([id]);
        });
    });

    describe("searchWords", () => {
        it("can search words given a query", () => {
            const state = createNewStoreState({byWord: wordIndex, byWordBigram: wordBigramIndex});
            expect(selectors.searchWords(state, "word")).toEqual([id]);
        });
    });
});
