import {ObjectifiedError} from "store/types";
import {NonFunctionProperties} from "utils/types";

// Native JavaScript errors just show up as empty errors when storing them.
// Need to convert them to plain objects.
// For reference: https://stackoverflow.com/a/20405830.
export const objectifyError = (err: Error): ObjectifiedError => {
    const plainObject: NonFunctionProperties<Error> = {} as NonFunctionProperties<Error>;

    Object.getOwnPropertyNames(err).forEach((key) => {
        plainObject[key] = err[key];
    });

    return plainObject;
};
