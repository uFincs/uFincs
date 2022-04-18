import {GenericObject} from "utils/types";
import {arrayToObject} from "./helperFunctions";

describe("arrayToObject", () => {
    const arbitraryObjectGenerator = (key: string, value: any): GenericObject => ({
        [key]: value,
        other: "prop"
    });

    const objectGenerator = (id: number | string): GenericObject =>
        arbitraryObjectGenerator("id", id);

    const newObjectGenerator = (id: number | string): GenericObject => ({
        ...objectGenerator(id),
        thing: "prop"
    });

    const arrayOfObjects = [objectGenerator(1), objectGenerator(2), objectGenerator(3)];

    it("can reduce an array of objects into an object of objects keyed by ID", () => {
        const objectOfObjects = {
            1: objectGenerator(1),
            2: objectGenerator(2),
            3: objectGenerator(3)
        };

        expect(arrayToObject(arrayOfObjects)).toEqual(objectOfObjects);
    });

    it("can apply a transform to the objects while reducing them", () => {
        const newObjectOfObjects = {
            1: newObjectGenerator(1),
            2: newObjectGenerator(2),
            3: newObjectGenerator(3)
        };

        const transformation = (obj: GenericObject): GenericObject => ({...obj, thing: "prop"});

        expect(arrayToObject(arrayOfObjects, {processor: transformation})).toEqual(
            newObjectOfObjects
        );
    });

    it("can reduce an array of objects into an object of objects keyed by an arbitrary object property", () => {
        const arbitraryObject1 = arbitraryObjectGenerator("aKey", 1);
        const arbitraryObject2 = arbitraryObjectGenerator("aKey", 2);

        const arbitraryArrayOfObjects = [arbitraryObject1, arbitraryObject2];
        const arbitraryObjectOfObjects = {1: arbitraryObject1, 2: arbitraryObject2};

        expect(arrayToObject(arbitraryArrayOfObjects, {property: "aKey"})).toEqual(
            arbitraryObjectOfObjects
        );
    });

    it("returns an empty object if the objects in the array don't have an ID property", () => {
        const invalidArrayOfObjects = [{test: "test"}, {test: "test"}];
        expect(arrayToObject(invalidArrayOfObjects)).toEqual({});
    });

    it("returns an empty object if the array is empty", () => {
        expect(arrayToObject([])).toEqual({});
    });
});
