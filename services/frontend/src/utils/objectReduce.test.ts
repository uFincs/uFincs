import objectReduce from "./objectReduce";

describe("objectReduce", () => {
    const objects = {
        a: {foo: "bar"},
        b: {foo: "bar"},
        c: {foo: "bar"},
        d: {foo: "bar"}
    };

    it("can apply reduce over a map of objects, just like how map works", () => {
        const newObjects = {
            a: {bar: "foo"},
            b: {bar: "foo"},
            c: {bar: "foo"},
            d: {bar: "foo"}
        };

        const result = objectReduce(objects, (x) => ({[x.foo]: "foo"}));

        expect(result).toEqual(newObjects);
    });

    it("doesn't add the result to the final map if the result was null", () => {
        const result = objectReduce(objects, (x, index) => (index % 2 === 0 ? x : null));

        expect(result).toEqual({
            a: {foo: "bar"},
            c: {foo: "bar"}
        });
    });

    it("doesn't add the result to the final map if the result was undefined", () => {
        const result = objectReduce(objects, (x, index) => (index % 2 === 0 ? x : undefined));

        expect(result).toEqual({
            a: {foo: "bar"},
            c: {foo: "bar"}
        });
    });

    it("doesn't add the result to the final map if the result was false", () => {
        const result = objectReduce(objects, (x, index) => (index % 2 === 0 ? x : false));

        expect(result).toEqual({
            a: {foo: "bar"},
            c: {foo: "bar"}
        });
    });

    it("does add the result to the final map if the result was 0", () => {
        const result = objectReduce(objects, (x, index) => (index % 2 === 0 ? x : 0));

        expect(result).toEqual({
            a: {foo: "bar"},
            b: 0,
            c: {foo: "bar"},
            d: 0
        });
    });

    it("does add the result to the final map if the result was an empty string", () => {
        const result = objectReduce(objects, (x, index) => (index % 2 === 0 ? x : ""));

        expect(result).toEqual({
            a: {foo: "bar"},
            b: "",
            c: {foo: "bar"},
            d: ""
        });
    });
});
