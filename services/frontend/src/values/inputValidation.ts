const emailRegex = /\S+@\S+\.\S+/;

const maxDescriptionLength = 120;
const maxFeedbackLength = 4096;
const maxNameLength = 80;
const maxNotesLength = 1024;

// This is less than 2^53, which is the amount when VS Code starts warning about
// integers not being able to be represented accurately for JavaScript.
//
// I think a couple trillion dollars should be enough for most everybody.
//
// Note: This is still much less than max BIGINT (9223372036854775807), which we _can_ support.
//       But won't. Just know that _actually_ supporting BIGINT means that numbers have to be
//       represented as strings, which is _way_ too much work.
const maxNumber = 10000000000000;

export default {
    emailRegex,
    maxDescriptionLength,
    maxFeedbackLength,
    maxNameLength,
    maxNotesLength,
    maxNumber
};
