import classNames from "classnames";
import React from "react";
import {useForm} from "react-hook-form";
import {Checkbox, TextAreaInput} from "components/atoms";
import {CollapsibleSection, SubmitButton} from "components/molecules";
import {Feedback, FeedbackType} from "models/";
import InputValidation from "values/inputValidation";
import connect, {ConnectedProps} from "./connect";
import "./FeedbackForm.scss";

interface FeedbackFormData {
    isAnonymous: boolean;
    message: string;
    stackTrace: string;
}

const PLACEHOLDERS = {
    [Feedback.ISSUE]: "Things are completely broken because...",
    [Feedback.IDEA]: "I would love if you could...",
    [Feedback.OTHER]: "What crazy thoughts do you have now?",
    unhandledError: "Before the error happened, I was..."
};

interface FeedbackFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The feedback type determines which placeholder message is used. */
    feedbackType?: FeedbackType;

    /** An error that was unhandled and must now be sent to us for debugging. */
    unhandledError?: Error;
}

/** The form the user can fill out to submit feedback about the app. */
const FeedbackForm = ({
    className,
    error,
    feedbackType = Feedback.ISSUE,
    loading = false,
    unhandledError,
    onSubmit
}: FeedbackFormProps) => {
    const {errors, handleSubmit, register} = useForm<FeedbackFormData>({
        defaultValues: {
            isAnonymous: false,
            stackTrace: unhandledError?.stack
        }
    });

    const finalOnSubmit = handleSubmit((data) => {
        let {message, ...otherData} = data;

        if (unhandledError) {
            message =
                `*User message*: ${message}\n\n*Error message*: ${unhandledError.message}\n\n` +
                `*Stack trace*:\n\n${unhandledError.stack}`;
        }

        onSubmit(new Feedback({...otherData, message, type: feedbackType}));
    });

    return (
        <form
            className={classNames("FeedbackForm", className)}
            data-testid="feedback-form"
            onSubmit={finalOnSubmit}
        >
            {unhandledError && (
                <>
                    <p>Uh oh, looks like you ran into an unexpected error:</p>
                    <p>&quot;{unhandledError.message}&quot;</p>
                </>
            )}

            <TextAreaInput
                className="FeedbackForm-message-input"
                name="message"
                autoFocus={true}
                placeholder={
                    unhandledError ? PLACEHOLDERS.unhandledError : PLACEHOLDERS[feedbackType]
                }
                ref={register({
                    required: "Message is missing",
                    maxLength: {
                        value: InputValidation.maxFeedbackLength,
                        message: `Message is longer than ${InputValidation.maxFeedbackLength} characters`
                    }
                })}
                error={errors.message?.message}
            />

            {unhandledError && (
                <CollapsibleSection id="FeedbackForm-stacktrace" label="Stack Trace">
                    <div className="FeedbackForm-stacktrace-container">
                        <p>You can redact any financial data from here, if any.</p>

                        <TextAreaInput
                            className="FeedbackForm-stacktrace-input"
                            name="stackTrace"
                            type="text"
                            label=""
                            placeholder=""
                            error={errors.stackTrace?.message}
                            ref={register({
                                required: "Stack Trace is missing",
                                maxLength: {
                                    value: InputValidation.maxFeedbackLength * 4,
                                    message:
                                        "Stack Trace is longer than " +
                                        `${InputValidation.maxFeedbackLength * 4} characters`
                                }
                            })}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {feedbackType !== Feedback.ISSUE && (
                <Checkbox
                    label="Submit anonymously"
                    name="isAnonymous"
                    title={
                        "If you submit anonymously, then your feedback won't be associated with your account " +
                        "and we won't be able to follow up with you on it."
                    }
                    ref={register()}
                />
            )}

            <SubmitButton error={error} loading={loading}>
                Submit {unhandledError ? "Error" : "Feedback"}
            </SubmitButton>
        </form>
    );
};

export const PureComponent = FeedbackForm;
export default connect(FeedbackForm);
