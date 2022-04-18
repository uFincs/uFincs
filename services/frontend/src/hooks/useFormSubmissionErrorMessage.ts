/** Hook for generating the error message that is shown over the submission button.
 *  This message attempts to summarize all of the errors in the form.
 *
 *  The `errors` object should be the one from `react-hook-form`.
 *
 *  The `fieldsGrammarMap` is an object that looks like this:
 *
 *  ```
 *  {
 *      [fieldName]: {
 *          article: "'the'", (or 'a' or 'an' or something like that)
 *          subject: "'fieldName'" (something that can be used in a sentence)
 *      }
 *  }
 *  ```
 *
 *  Basically, it's just a way of mapping the names of the fields (which are keys in the
 *  errors object) to a set of English grammar friendly tokens for use in the error message. */
const useFormSubmissionErrorMessage = (
    errors: Record<string, any>,
    fieldsGrammarMap: Record<string, Record<"article" | "subject", string>>
): string => {
    const keys = Object.keys(errors);

    if (keys.length === 0) {
        return "";
    } else if (keys.length === 1) {
        const originalMessage = errors[keys[0]].message;
        const {article, subject} = fieldsGrammarMap[keys[0]];

        if (originalMessage.includes("longer")) {
            return `Looks like ${article} ${subject} is too long`;
        } else if (originalMessage.includes("valid")) {
            return `Looks like ${article} ${subject} is invalid`;
        } else if (originalMessage.includes("big")) {
            return `Looks like ${article} ${subject} is too big`;
        } else if (originalMessage.includes("missing")) {
            return `Looks like you're missing ${article} ${subject}`;
        } else {
            return `Looks like ${article} ${subject} is wrong`;
        }
    } else {
        return "Looks like you're missing some things";
    }
};

export default useFormSubmissionErrorMessage;
