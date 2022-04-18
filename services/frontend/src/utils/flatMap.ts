/** Basically just a polyfill for `flatMap` for old versions of.. Safari. */
const flatMap = <T, V>(values: Array<T>, mapper: (value: T) => Array<V>): Array<V> => {
    let acc: Array<V> = [];

    for (let i = 0; i < values.length; i++) {
        acc = acc.concat(mapper(values[i]));
    }

    return acc;
};

export default flatMap;
