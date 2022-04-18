import classNames from "classnames";
import React, {useEffect, useRef, useState} from "react";
import {BackButton, CloseButton, DialogContainer} from "components/atoms";
import {FeedbackForm, FeedbackOptions} from "components/molecules";
import {Feedback, FeedbackType} from "models/";
import {transitionShortLength as animationTime} from "utils/parsedStyles";
import connect, {ConnectedProps} from "./connect";
import "./FeedbackDialog.scss";

const FORM_TITLES = {
    [Feedback.ISSUE]: "Report an Issue",
    [Feedback.IDEA]: "Share an Idea",
    [Feedback.OTHER]: "Tell us..."
};

/* Hooks */

// This hook delays clearing the value of `unhandledError` when the dialog closes, so that the dialog
// layout doesn't briefly flicker back to the non-error layout (which looks really stupid).
// Once the dialog _is_ closed though, then we can clear the value.
//
// Yes, this is kinda hacky.
const useDelayClearingError = (isVisible: boolean, unhandledError?: Error) => {
    // Keep a reference to the 'old' error value.
    const oldUnhandledError = useRef(unhandledError);

    if (isVisible && unhandledError) {
        // Update it immediately whenever it's set.
        oldUnhandledError.current = unhandledError;
    }

    // Wait through the dialog closing animation time before clearing the error.
    useEffect(() => {
        if (!isVisible && !unhandledError) {
            setTimeout(() => {
                oldUnhandledError.current = unhandledError;

                // Use 2x the animation time just for some buffer room.
            }, animationTime * 2);
        }
    }, [isVisible, unhandledError]);

    return oldUnhandledError.current;
};

/* Components */

interface FeedbackDialogProps extends ConnectedProps {}

/** The dialog that the user can use to provide feedback about the app. */
const FeedbackDialog = ({unhandledError, onClose}: FeedbackDialogProps) => {
    const [selectedType, setSelectedType] = useState<FeedbackType | null>(
        unhandledError ? Feedback.ISSUE : null
    );

    return selectedType === null ? (
        <PickTypeBody onClose={onClose} setSelectedType={setSelectedType} />
    ) : (
        <FormBody
            type={selectedType}
            unhandledError={unhandledError}
            onBack={() => setSelectedType(null)}
            onClose={onClose}
        />
    );
};

// Need to wrap the body of the dialog so that the `selectedType` state is _inside_ the container.
// Otherwise, the state is persisted between open/closes of the dialog.
const WrappedFeedbackDialog = ({isVisible, unhandledError, onClose}: FeedbackDialogProps) => {
    const passedUnhandledError = useDelayClearingError(isVisible, unhandledError);

    return (
        <DialogContainer
            className={classNames("FeedbackDialog", {
                "FeedbackDialog--unhandled-error": !!passedUnhandledError
            })}
            data-testid="feedback-dialog"
            isVisible={isVisible}
            title="Send Feedback"
            onClose={onClose}
        >
            <FeedbackDialog
                isVisible={isVisible}
                unhandledError={passedUnhandledError}
                onClose={onClose}
            />
        </DialogContainer>
    );
};

export const PureComponent = WrappedFeedbackDialog;
export default connect(WrappedFeedbackDialog);

/* Other Components */

interface HeaderProps {
    /** Whether or not to show the Back button.
     *  Used for the second part of the dialog, the Feedback Form. */
    showBack?: boolean;

    /** The title to show in the header. */
    title: string;

    /** Handler for the Back button. */
    onBack?: () => void;

    /** Handler for the Close button. */
    onClose: () => void;
}

const Header = ({showBack = false, title, onBack, onClose}: HeaderProps) => (
    <div className="FeedbackDialog-header">
        <div className="FeedbackDialog-header-left-section">
            {showBack && <BackButton data-testid="feedback-dialog-back-button" onClick={onBack} />}

            <h2>{title}</h2>
        </div>

        <CloseButton data-testid="feedback-dialog-close-button" onClick={onClose} />
    </div>
);

interface PickTypeBodyProps {
    /** Handler for the Close button. */
    onClose: () => void;

    /** Handler when one of the type options gets selected.. */
    setSelectedType: (type: FeedbackType) => void;
}

const PickTypeBody = ({onClose, setSelectedType}: PickTypeBodyProps) => (
    <>
        <Header title="What's up?" onClose={onClose} />

        <div className="FeedbackDialog-body">
            <FeedbackOptions onTypeSelected={setSelectedType} />
        </div>
    </>
);

interface FormBodyProps {
    /** The currently selected type. */
    type: FeedbackType;

    /** An error that was unhandled and must now be sent to us for debugging. */
    unhandledError?: Error;

    /** Handler for the Back button. */
    onBack: () => void;

    /** Handler for the Close button. */
    onClose: () => void;
}

const FormBody = ({type, unhandledError, onBack, onClose}: FormBodyProps) => {
    return (
        <>
            <Header
                showBack={!unhandledError}
                title={FORM_TITLES[type]}
                onBack={onBack}
                onClose={onClose}
            />

            <div className="FeedbackDialog-body">
                <FeedbackForm feedbackType={type} unhandledError={unhandledError} />
            </div>
        </>
    );
};
