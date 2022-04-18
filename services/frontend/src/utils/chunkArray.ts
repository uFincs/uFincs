/** Chunks an array into an array of multiple arrays for parallel processing. */
const chunkArray = <T>(array: Array<T>, chunkSize = 10): Array<Array<T>> => {
    const chunkedArray = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunkedArray.push(chunk);
    }

    return chunkedArray;
};

export default chunkArray;
