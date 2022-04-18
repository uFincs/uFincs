import classNames from "classnames";
import React from "react";
import {LinkButton} from "components/atoms";
import {FormHeader, SubmitButton} from "components/molecules";
import {FormHeaderProps} from "components/molecules/FormHeader";
import "./FormContainer.scss";

interface FormContainerProps
    extends FormHeaderProps,
        FormSubmissionButtonsProps,
        React.FormHTMLAttributes<HTMLFormElement> {
    /** Custom class name. */
    className?: string;

    /** Whether or not to use the 'invalid' view for the form.
     *
     *  The 'invalid' view is used for things like trying to edit an entity that doesn't exist.  */
    isInvalidForm?: boolean;

    /** The content of the form to display. */
    children: React.ReactNode;
}

/** A container for a (sidebar) for, including header and submission buttons. */
const FormContainer = ({
    className,
    closeButtonTestId,
    entityName,
    isEditing,
    isInvalidForm = false,
    submissionError,
    children,
    onClose,
    onMakeAnother,
    ...otherProps
}: FormContainerProps) => (
    <form
        className={classNames(
            "FormContainer",
            {"FormContainer--invalid": isInvalidForm},
            className
        )}
        {...otherProps}
    >
        <FormHeader
            closeButtonTestId={closeButtonTestId}
            entityName={entityName}
            isEditing={isEditing}
            onClose={onClose}
        />

        {children}

        {!isInvalidForm && (
            <>
                <FormSubmissionButtons
                    entityName={entityName}
                    isEditing={isEditing}
                    submissionError={submissionError}
                    onMakeAnother={onMakeAnother}
                />

                <div className="padding-spacer" aria-hidden={true} />
            </>
        )}
    </form>
);

export default FormContainer;

/* Other Components */

interface FormSubmissionButtonsProps {
    /** The name of the entity that this form applies to. */
    entityName: string;

    /** Whether to display 'Edit' or 'New' in the title. */
    isEditing: boolean;

    /** The error to display on top of the submission button. */
    submissionError?: string;

    /** Handler for making another one of the entities. */
    onMakeAnother?: () => void;
}

const FormSubmissionButtons = ({
    entityName,
    isEditing,
    submissionError = "",
    onMakeAnother
}: FormSubmissionButtonsProps) => (
    <div className="FormSubmissionButtons">
        <SubmitButton containerClassName="FormContainer-SubmitButton" error={submissionError}>
            {isEditing ? "Update" : "Add"} {entityName}
        </SubmitButton>

        {!isEditing && onMakeAnother && (
            <LinkButton
                className="FormSubmissionButtons-make-another-button"
                onClick={onMakeAnother}
                title="Add & Make Another [Ctrl+Enter]"
            >
                Add & Make Another
            </LinkButton>
        )}
    </div>
);
