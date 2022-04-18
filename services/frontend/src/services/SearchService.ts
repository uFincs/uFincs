import stemmer from "stemmer";
import {Transaction, TransactionData} from "models/";
import {removeStopwords} from "vendor/stopword";

type Resource = string;

interface ResourceIndex {
    [resource: string]: Resource;
}

interface ByBigramIndex {
    [bigram: string]: ResourceIndex;
}

type Word = string;
type WordSet = Array<Word>;
type WordSets = Array<WordSet>;

interface ByWordIndex {
    [word: string]: ResourceIndex;
}

interface WordIndex {
    [word: string]: Word;
}

interface ByWordBigramIndex {
    [bigram: string]: WordIndex;
}

export default class SearchService {
    // Because we use bigrams (two letter 'words') as the tokens, the minimum valid query length is 2.
    static MIN_QUERY_LENGTH = 2;

    static searchBigrams(query: string, bigramIndex: ByBigramIndex): Array<Resource> {
        const bigram = SearchService.generateBigram(query);

        if (bigram in bigramIndex) {
            return Object.keys(bigramIndex[bigram]);
        } else {
            return [];
        }
    }

    static searchWords(
        query: string,
        wordIndex: ByWordIndex,
        wordBigramIndex: ByWordBigramIndex
    ): Array<Resource> {
        // Create word sets for each word found in the query.
        // This is so that we can iterate over each set independently and then perform
        // an intersection of word sets for each word in the query.
        // This results in finding transactions that have all of the words from the query.
        const wordSets = SearchService._searchWordBigrams(query, wordBigramIndex);

        // If any of the 'words' in the query don't match any words in the bigram index,
        // then that means the user entered a word that doesn't match anything.
        //
        // In order to tighten up the search results (i.e. to make them stricter), we should
        // throw out the results whenever the user enters a non-matching word.
        //
        // This way, if the user starts typing nonsense (along with matching words), it makes
        // more sense for them to find nothing than some things with ignored nonsense
        // (at least, this is how most search algos seem to work).
        if (wordSets.some((words) => words.length === 0)) {
            return [];
        }

        const resultIds = wordSets.reduce<Set<Resource>>((acc, words: WordSet) => {
            const ids = words.reduce<Set<Resource>>((acc2, word: Word) => {
                const ids = word in wordIndex ? Object.keys(wordIndex[word]) : [];
                return new Set([...acc2, ...ids]);
            }, new Set());

            if (acc.size === 0) {
                // Don't intersect if no IDs have been collected yet
                return ids;
            } else if (ids.size === 0) {
                // Don't intersect if no IDs were found
                return acc;
            } else {
                // Intersect all of the previous and newly found IDs
                return new Set([...acc].filter((id) => ids.has(id)));
            }
        }, new Set());

        return Array.from(resultIds);
    }

    static orderTransactions(
        transactions: Array<TransactionData | null> = [],
        keepLatestDuplicateTransaction = true
    ): Array<TransactionData> {
        const results = keepLatestDuplicateTransaction
            ? SearchService._keepLatestDuplicateTransaction(transactions)
            : SearchService._removeDuplicates(transactions);

        return results.sort(Transaction.dateSortAsc).reverse();
    }

    static generateBigram(string: string = ""): string {
        return SearchService.cleanString(string).slice(0, 2);
    }

    static generateWords(string: string = ""): Array<Word> {
        if (!string) {
            return [];
        }

        const cleaned = SearchService.cleanString(string);
        const tokenized = cleaned.split(" ");
        const stopWordsRemoved = removeStopwords(tokenized);
        const stemmed = stopWordsRemoved.map(stemmer);

        // Because we search on bigrams, we should ignore words that are only 1 letter long.
        // This way, while the user is typing out their query, single letter words
        // (i.e. words the user is still typing) don't cause the bigram search to find nothing,
        // which then causes the query to find nothing overall.
        //
        // For example, if the user's query is "ssd d" (where d then becomes desktop), we don't want
        // the "d" to resolve to an empty word after bigram searching, which would then cause the
        // whole query to return nothing, since there'd be a 'word' that didn't match the description.
        const singleLetterWordsRemoved = stemmed.filter((word) => word.length > 1);

        return singleLetterWordsRemoved;
    }

    static stringStartsWithQuery(string: string = "", query: string = ""): boolean {
        return SearchService.cleanString(string).startsWith(SearchService.cleanString(query));
    }

    static stringIncludesQuery(string: string, query: string): boolean {
        return SearchService.cleanString(string).includes(SearchService.cleanString(query));
    }

    static stringsEqual(string1: string, string2: string): boolean {
        return SearchService.cleanString(string1) === SearchService.cleanString(string2);
    }

    static cleanString(string: string = ""): string {
        return string ? SearchService._removePunctuation(string.trim().toLowerCase()) : "";
    }

    static _searchWordBigrams(query: string, wordBigramIndex: ByWordBigramIndex): WordSets {
        const words = SearchService.generateWords(query);

        return words.reduce<WordSets>((acc, word) => {
            const resultWords = SearchService.searchBigrams(word, wordBigramIndex).filter(
                (resultWord) => resultWord.startsWith(word)
            );

            acc.push(resultWords);
            return acc;
        }, []);
    }

    static _removeDuplicates(transactions: Array<TransactionData | null>): Array<TransactionData> {
        return Object.values(
            transactions.reduce((acc, transaction) => {
                if (transaction && !(transaction.id in acc)) {
                    acc[transaction.id] = transaction;
                }

                return acc;
            }, {} as Record<string, TransactionData>)
        );
    }

    static _keepLatestDuplicateTransaction(
        transactions: Array<TransactionData | null> = []
    ): Array<TransactionData> {
        return Object.values(
            transactions.reduce<Record<string, TransactionData>>((acc, transaction) => {
                if (!transaction) {
                    return acc;
                }

                const description = SearchService.cleanString(transaction.description);

                if (description in acc) {
                    const sameDescriptionTransaction = acc[description];

                    // Keep the newest transaction with the same description
                    if (!Transaction.isNewerTransaction(transaction, sameDescriptionTransaction)) {
                        return acc;
                    }
                }

                acc[description] = transaction;
                return acc;
            }, {})
        );
    }

    static _removePunctuation(string: string = ""): string {
        return string.replace(/[~`!@#$%^&*(){}[\];:"'<,.>?/\\|_+=-]/g, "");
    }
}
