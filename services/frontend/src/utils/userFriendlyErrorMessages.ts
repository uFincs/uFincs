import isNetworkError from "utils/isNetworkError";

const userFriendlyErrorMessages = (errorMessage: string) => {
    if (isNetworkError(errorMessage)) {
        return "Network error - try again later";
    } else {
        // This was originally a switch because we handled the network error check here, but now
        // it's just a switch in case we add future cases.
        switch (errorMessage) {
            default:
                return errorMessage;
        }
    }
};

export default userFriendlyErrorMessages;
