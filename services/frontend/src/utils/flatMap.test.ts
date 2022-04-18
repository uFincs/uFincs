import flatMap from "./flatMap";

describe("flatMap", () => {
    it("can map an array using a callback that generates an array back into an array", () => {
        const values = [1, 2, 3, 4];
        const callback = (value: number) => new Array(value).fill(value);

        const expected = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
        expect(flatMap(values, callback)).toEqual(expected);
    });
});
