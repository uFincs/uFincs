import {GenericObject} from "utils/types";

type OnChangeValue = {
    target?: {value?: string};
};

/* Used to extract the value from `onChange` handlers that could either
 * be in the form of an event object from an input, or just a plain
 * value from.. anything that isn't an input.
 */
export const extractOnChangeValue = (value: OnChangeValue): string => {
    if (value?.target) {
        if (value.target?.value) {
            return value.target.value;
        } else {
            return "";
        }
    } else {
        return value as string;
    }
};

const identity = (x: any): any => x;

interface ArrayToObjectOptions {
    processor?: (obj: GenericObject) => any;
    property?: string;
}

export const arrayToObject = (
    array: Array<GenericObject> = [],
    {processor = identity, property = "id"}: ArrayToObjectOptions = {}
): Record<string, any> =>
    array.reduce((acc, obj) => {
        if (property in obj) {
            acc[obj[property]] = processor(obj);
        }

        return acc;
    }, {});

export const takeOwnPropIfDefined = <T>(ownProp: T | undefined, reduxProp: T): T =>
    ownProp !== undefined ? ownProp : reduxProp;

export const sortStrings = (stringA: string, stringB: string): number => {
    if (stringA > stringB) {
        return 1;
    } else if (stringA < stringB) {
        return -1;
    } else {
        return 0;
    }
};

export const deepClone = <T>(object: T): T => JSON.parse(JSON.stringify(object));
