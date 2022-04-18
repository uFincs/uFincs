import {renderHook} from "@testing-library/react-hooks";
import {Transaction} from "models/";
import useIntersectTransactions from "./useIntersectTransactions";

describe("useIntersectTransactions", () => {
    const transaction1 = new Transaction({id: "1"});
    const transaction2 = new Transaction({id: "2"});
    const transaction3 = new Transaction({id: "3"});
    const transaction4 = new Transaction({id: "4"});

    const transactions1 = [transaction1, transaction3, transaction4];
    const transactions2 = [transaction1, transaction2, transaction4];

    it("finds the intersection of two arrays of transactions", () => {
        const {result} = renderHook(() => useIntersectTransactions(transactions1, transactions2));

        expect(result.current).toEqual([transaction1, transaction4]);
    });

    it("takes the second array if the first is empty", () => {
        const {result} = renderHook(() => useIntersectTransactions([], transactions2));

        expect(result.current).toEqual(transactions2);
    });

    it("takes the first array if the second is empty", () => {
        const {result} = renderHook(() => useIntersectTransactions(transactions1, []));

        expect(result.current).toEqual(transactions1);
    });

    it("returns an empty array when intersecting with an empty array and ignoring empty arrays", () => {
        const {result} = renderHook(() => useIntersectTransactions(transactions1, [], false));

        expect(result.current).toEqual([]);

        const {result: result2} = renderHook(() =>
            useIntersectTransactions([], transactions2, false)
        );

        expect(result2.current).toEqual([]);
    });
});
