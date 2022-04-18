const objectReduce = <T, R>(
    objects: Record<string, T>,
    callback: (object: T, index: number) => R | undefined | null | false
) => {
    const keys = Object.keys(objects);
    const returnValue: Record<string, R> = {};

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const object = objects[key];

        if (object) {
            const result = callback(object, i);

            if (!(result === undefined || result === null || result === false)) {
                returnValue[key] = result;
            }
        }
    }

    return returnValue;
};

export default objectReduce;
