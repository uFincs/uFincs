const deepCopy = (object: object) => JSON.parse(JSON.stringify(object));

export default deepCopy;
