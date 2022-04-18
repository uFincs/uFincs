import {Transaction} from "models/";
import SearchService from "./SearchService";

describe("searchBigrams", () => {
    const id1 = "id1";
    const id2 = "id2";
    const id3 = "id3";
    const id4 = "id4";

    const bigramIndex = {
        bo: {
            [id1]: id1,
            [id2]: id2
        },
        pa: {
            [id3]: id3
        },
        yo: {
            [id4]: id4
        }
    };

    it("can do a bigram search for a given query", () => {
        expect(SearchService.searchBigrams("Bought a new car", bigramIndex)).toEqual([id1, id2]);

        expect(SearchService.searchBigrams("Paid down credit card", bigramIndex)).toEqual([id3]);

        expect(SearchService.searchBigrams("Yo", bigramIndex)).toEqual([id4]);
    });

    it("doesn't care what case the query is in", () => {
        expect(SearchService.searchBigrams("bOuGHt a nEW CaR", bigramIndex)).toEqual([id1, id2]);
    });

    it("doesn't care if there are leading or trailing spaces", () => {
        expect(SearchService.searchBigrams("  bOuGHt a nEW CaR  ", bigramIndex)).toEqual([
            id1,
            id2
        ]);
    });

    it("returns nothing when given an empty query", () => {
        expect(SearchService.searchBigrams("", bigramIndex)).toEqual([]);
    });

    it("returns nothing when there the query is only a single character", () => {
        expect(SearchService.searchBigrams("b", bigramIndex)).toEqual([]);
    });

    it("returns nothing when the query has no matching bigrams", () => {
        expect(SearchService.searchBigrams("hello", bigramIndex)).toEqual([]);
    });
});

describe("searchWords", () => {
    const id1 = "id1";
    const id2 = "id2";
    const id3 = "id3";
    const id4 = "id4";

    const wordIndex = {
        bought: {
            [id1]: id1,
            [id2]: id2
        },
        paid: {
            [id3]: id3
        },
        yolo: {
            [id1]: id1,
            [id4]: id4
        }
    };

    const wordBigramIndex = {
        bo: {
            bought: "bought"
        },
        pa: {
            paid: "paid"
        },
        yo: {
            yolo: "yolo"
        }
    };

    it("can search over a bigram index to find words and then map those words to what's being searched", () => {
        expect(SearchService.searchWords("boug", wordIndex, wordBigramIndex)).toEqual([id1, id2]);
    });

    it("can search for multiple words and find all results that have all words", () => {
        expect(SearchService.searchWords("bought yolo", wordIndex, wordBigramIndex)).toEqual([id1]);
    });

    it("returns nothing when there are words that don't match anything", () => {
        expect(SearchService.searchWords("bought turtle", wordIndex, wordBigramIndex)).toEqual([]);
    });

    it("ignores single letter 'words' in the query", () => {
        expect(SearchService.searchWords("bought t", wordIndex, wordBigramIndex)).toEqual([
            id1,
            id2
        ]);
    });

    it("doesn't care what case the query is in", () => {
        expect(SearchService.searchWords("BoUG", wordIndex, wordBigramIndex)).toEqual([id1, id2]);
    });

    it("doesn't care if there are leading or trailing spaces", () => {
        expect(SearchService.searchWords("   boug   ", wordIndex, wordBigramIndex)).toEqual([
            id1,
            id2
        ]);
    });

    it("returns nothing when given an empty query", () => {
        expect(SearchService.searchWords("", wordIndex, wordBigramIndex)).toEqual([]);
    });

    it("returns nothing when the query has no matching words", () => {
        expect(SearchService.searchWords("what", wordIndex, wordBigramIndex)).toEqual([]);
    });

    it("returns nothing when the query is a singe word", () => {
        expect(SearchService.searchWords("b", wordIndex, wordBigramIndex)).toEqual([]);
    });
});

describe("orderTransactions", () => {
    it("can order the transactions by latest created first", () => {
        const transaction1 = new Transaction({
            description: "Bought some lunch",
            date: "2019-01-03"
        });
        const transaction2 = new Transaction({description: "Paid down card", date: "2019-01-02"});
        const transaction3 = new Transaction({description: "Bought a new car", date: "2019-01-01"});

        const outOfOrderTransactions = [transaction3, transaction2, transaction1];

        expect(SearchService.orderTransactions(outOfOrderTransactions)).toEqual([
            transaction1,
            transaction2,
            transaction3
        ]);
    });

    it("can keep only the latest transaction when there are multiple with the same description", () => {
        const transaction1 = new Transaction({description: "Bought a new car", date: "2019-01-01"});
        const transaction2 = new Transaction({description: "Bought a new car", date: "2019-01-02"});
        const transaction3 = new Transaction({
            description: "Bought some lunch",
            date: "2018-01-01"
        });

        const transactions = [transaction1, transaction2, transaction3];

        expect(SearchService.orderTransactions(transactions)).toEqual([transaction2, transaction3]);
    });

    it("can only remove duplicate (ID) transactions", () => {
        const transaction1 = new Transaction({
            id: "1",
            description: "Bought a new car",
            date: "2019-01-01"
        });

        const transaction2 = new Transaction({
            id: "1",
            description: "Bought a new car",
            date: "2019-01-01"
        });

        const transaction3 = new Transaction({
            description: "Bought some lunch",
            date: "2018-01-01"
        });

        const transactions = [transaction1, transaction2, transaction3];

        expect(SearchService.orderTransactions(transactions, false)).toEqual([
            transaction1,
            transaction3
        ]);
    });

    it("returns nothing when given an empty set of transactions", () => {
        expect(SearchService.orderTransactions([])).toEqual([]);
        expect(SearchService.orderTransactions()).toEqual([]);
    });
});

describe("generateBigram", () => {
    it("generates the first bigram of a given string", () => {
        expect(SearchService.generateBigram("here is a string")).toBe("he");
    });

    it("ignores letter case", () => {
        expect(SearchService.generateBigram("Here IS a StrINg")).toBe("he");
    });

    it("ignores leading/trailing spaces", () => {
        expect(SearchService.generateBigram("   here is a string   ")).toBe("he");
    });

    it("returns an empty string given an empty/nonexistent string", () => {
        expect(SearchService.generateBigram("")).toBe("");

        // @ts-ignore Allow testing invalid values.
        expect(SearchService.generateBigram(null)).toBe("");

        expect(SearchService.generateBigram(undefined)).toBe("");
    });
});

describe("generateWords", () => {
    it("generates a list of the words in a given string", () => {
        expect(SearchService.generateWords("car plane train")).toEqual(["car", "plane", "train"]);
    });

    it("converts words to their stemmed form for more generic searching", () => {
        expect(SearchService.generateWords("testing explosions")).toEqual(["test", "explos"]);
    });

    it("removes discards any stopwords from the string", () => {
        expect(SearchService.generateWords("this is a sentence")).toEqual(["sentenc"]);
    });

    it("ignores leading/trailing spaces", () => {
        expect(SearchService.generateWords("  car plane train   ")).toEqual([
            "car",
            "plane",
            "train"
        ]);
    });

    it("ignores letter case", () => {
        expect(SearchService.generateWords("  CaR PLAne TRAIN   ")).toEqual([
            "car",
            "plane",
            "train"
        ]);
    });

    it("ignores single letter 'words'", () => {
        expect(SearchService.generateWords("car plane train z")).toEqual(["car", "plane", "train"]);
    });

    it("returns an empty array given an empty string", () => {
        expect(SearchService.generateWords("")).toEqual([]);

        // @ts-ignore Allow testing invalid values.
        expect(SearchService.generateWords(null)).toEqual([]);

        expect(SearchService.generateWords(undefined)).toEqual([]);
    });
});

describe("stringStartsWithQuery", () => {
    it("returns true when a given string starts with a query", () => {
        expect(SearchService.stringStartsWithQuery("a string", "a str")).toBe(true);
    });

    it("returns false when a given string doesn't start with a query", () => {
        expect(SearchService.stringStartsWithQuery("a string", "ing")).toBe(false);
    });

    it("ignores leading/trailing spaces and letter case", () => {
        expect(SearchService.stringStartsWithQuery("   A sTriNg   ", "  a StR  ")).toBe(true);
    });
});

describe("stringIncludesQuery", () => {
    it("returns true when a given string includes a query", () => {
        expect(SearchService.stringIncludesQuery("a string", "ing")).toBe(true);
    });

    it("returns false when a given string doesn't include a query", () => {
        expect(SearchService.stringIncludesQuery("a string", "no")).toBe(false);
    });

    it("ignores leading/trailing spaces and letter case", () => {
        expect(SearchService.stringIncludesQuery("   A sTriNg   ", "  a StR  ")).toBe(true);
    });
});

describe("stringsEqual", () => {
    it("returns true when a given string equals another string", () => {
        expect(SearchService.stringsEqual("a string", "a string")).toBe(true);
    });

    it("returns false when a given string doesn't equal another string", () => {
        expect(SearchService.stringsEqual("a string", "no")).toBe(false);
    });

    it("ignores leading/trailing spaces and letter case", () => {
        expect(SearchService.stringsEqual("   A sTriNg   ", "  a StRING  ")).toBe(true);
    });
});

describe("cleanString", () => {
    it("trims any leading/trailing spaces", () => {
        expect(SearchService.cleanString("   test")).toBe("test");
        expect(SearchService.cleanString("test   ")).toBe("test");
        expect(SearchService.cleanString("   test   ")).toBe("test");
    });

    it("makes the whole string lower case", () => {
        expect(SearchService.cleanString("tEsT")).toEqual("test");
    });

    it("removes any punctuation from the string", () => {
        expect(SearchService.cleanString("test. this is a test!")).toEqual("test this is a test");
    });

    it("returns an empty string when given null or undefined", () => {
        // @ts-ignore Allow testing null.
        expect(SearchService.cleanString(null)).toEqual("");

        // @ts-ignore Allow testing undefined.
        expect(SearchService.cleanString(undefined)).toEqual("");
    });
});
