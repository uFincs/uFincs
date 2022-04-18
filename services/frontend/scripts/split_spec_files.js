const fs = require("fs");

// Adapted from https://stackoverflow.com/a/33711952.
const DESCRIBE_BLOCKS_REGEX = /^describe\([\s\S]*?^}\);/gm;

const SPECS_FOLDER = "cypress/integration";
const TEMP_SPECS_FOLDER = "cypress/tempIntegration";

const createTempFolder = () => {
    if (fs.existsSync(TEMP_SPECS_FOLDER)) {
        fs.rmSync(TEMP_SPECS_FOLDER, {recursive: true, force: true});
    }

    fs.mkdirSync(TEMP_SPECS_FOLDER);
};

const extractHeaderBlock = (contents) => {
    // Matches everything up till the first "describe" block.
    // Adapted from https://stackoverflow.com/a/8584837.
    return contents.substring(0, contents.indexOf("describe("));
};

const extractDescribeBlocks = (contents) => {
    return contents.match(DESCRIBE_BLOCKS_REGEX);
};

const formatTempFileName = (fileName, index) => {
    // Split the file name so that we can inject the index before the first file extension.
    // Makes for more aesthetically pleasing file names.
    const splitFileName = fileName.split(".");

    return `${TEMP_SPECS_FOLDER}/${splitFileName[0]}-${index}.${splitFileName[1]}.${splitFileName[2]}`;
};

const splitSpecFiles = () => {
    const files = fs.readdirSync(SPECS_FOLDER);

    for (const file of files) {
        const contents = fs.readFileSync(`${SPECS_FOLDER}/${file}`).toString();

        const headerBlock = extractHeaderBlock(contents);
        const describeBlocks = extractDescribeBlocks(contents);

        for (let i = 0; i < describeBlocks.length; i++) {
            const describeBlock = describeBlocks[i];
            const newFile = `${headerBlock}\n${describeBlock}`;

            fs.writeFileSync(formatTempFileName(file, i), newFile);
        }
    }
};

// MAIN

createTempFolder();
splitSpecFiles();
