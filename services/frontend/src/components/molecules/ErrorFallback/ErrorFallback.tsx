import classNames from "classnames";
import React, {useCallback} from "react";
import {Error} from "assets/graphics";
import {OutlineButton} from "components/atoms";
import {EmptyArea} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./ErrorFallback.scss";

interface ErrorFallbackProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The error passed by the Error Boundary. */
    error: Error;
}

/** The default fallback component for Error Boundaries. Just shows a message.
 *
 *  Unhandled errors get queued to the `unhandledErrors` slice to be handled separately. */
const ErrorFallback = ({className, error, onSendFeedback}: ErrorFallbackProps) => {
    const onRefresh = useCallback(() => {
        window.location.reload();
    }, []);

    const onSendFeedbackClick = useCallback(() => {
        onSendFeedback(error);
    }, [error, onSendFeedback]);

    return (
        <EmptyArea
            className={classNames("ErrorFallback", className)}
            data-testid="error-fallback"
            Graphic={Error}
            // I don't know why, but I guess React escapes string props or something? Cause when I pass
            // the string as `=""` instead of `={""}`, then the newline shows up as `\\n` (VSCode even
            // doesn't highlight the newline like it normally does). So, in order for the string splitting
            // to work properly, pass it so that the newline is a newline.
            title={"Error, error!\nThis wasn't supposed to happen."}
            message="Uh, try refreshing the page? That's a good trick!"
            subMessage="Otherwise, let us know and we'll try to fix it."
            actionLabel="Refresh"
            onClick={onRefresh}
        >
            <SendFeedbackAction onSendFeedback={onSendFeedbackClick} />
        </EmptyArea>
    );
};

export default connect(ErrorFallback);

/* Other Components */

interface SendFeedbackActionProps {
    onSendFeedback: () => void;
}

const SendFeedbackAction = ({onSendFeedback}: SendFeedbackActionProps) => (
    <div className="SendFeedbackAction">
        <p className="SendFeedbackAction-or">- or -</p>

        <OutlineButton onClick={onSendFeedback}>Send Feedback</OutlineButton>
    </div>
);
