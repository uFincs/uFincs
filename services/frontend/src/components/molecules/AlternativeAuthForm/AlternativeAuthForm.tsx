import classNames from "classnames";
import React from "react";
import {Card, OutlineButton, TextField} from "components/atoms";
import {AuthType} from "components/molecules/AuthForm";
import "./AlternativeAuthForm.scss";

interface AlternativeAuthFormProps {
    /** Custom class name. */
    className?: string;

    /** Disable the form so that the button isn't clickable. */
    disabled?: boolean;

    /** The opposite type of authentication that this form should direct to.
     *  For example, if the given type is `login`, then this form will provide the alternative,
     *  which is `signup`.
     */
    type: AuthType;

    /** Handler for clicks. */
    onClick?: (e: React.MouseEvent) => void;
}

const mapDescription = (type: AuthType) => {
    switch (type) {
        case AuthType.login:
            return "Need an account?";
        case AuthType.signup:
            return "Have an account?";
        default:
            return "Need an account?";
    }
};

const mapLabel = (type: AuthType) => {
    switch (type) {
        case AuthType.login:
            return "Sign Up";
        case AuthType.signup:
            return "Login";
        default:
            return "Sign Up";
    }
};

/** A small form that compliments the main `AuthForm`.
 *  It offers the user the option to accomplish the opposite (i.e. alternative)
 *  auth action of the main form.
 */
const AlternativeAuthForm = ({className, disabled, type, onClick}: AlternativeAuthFormProps) => (
    <Card className={classNames("AlternativeAuthForm", className)}>
        <TextField className="AlternativeAuthForm-TextField">{mapDescription(type)}</TextField>

        <OutlineButton
            className="AlternativeAuthForm-OutlineButton"
            colorTheme="light"
            disabled={disabled}
            onClick={onClick}
        >
            {mapLabel(type)}
        </OutlineButton>
    </Card>
);

export default AlternativeAuthForm;
