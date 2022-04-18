import classNames from "classnames";
import React from "react";
import {CloseButton, OverlineHeading} from "components/atoms";
import "./FormHeader.scss";

export interface FormHeaderProps {
    /** Custom class name. */
    className?: string;

    /** The test ID for the close button. */
    closeButtonTestId: string;

    /** The name of the entity that this form applies to. */
    entityName: string;

    /** Whether to display 'Edit' or 'New' in the title. */
    isEditing: boolean;

    /** Handler for closing the form from the 'X' button in the header. */
    onClose: () => void;
}

/** The header for the `FormContainer`, which contains the heading and close button. */
const FormHeader = ({
    className,
    closeButtonTestId,
    entityName,
    isEditing,
    onClose
}: FormHeaderProps) => (
    <div className={classNames("FormHeader", className)}>
        <OverlineHeading>
            {isEditing ? "Edit" : "New"} {entityName}
        </OverlineHeading>

        <CloseButton
            className="FormHeader-close-button"
            data-testid={closeButtonTestId}
            onClick={onClose}
        />
    </div>
);

export default FormHeader;
