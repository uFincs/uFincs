import classNames from "classnames";
import * as React from "react";
import {LoadingSpinner, ShadowButton, TextField} from "components/atoms";
import {ButtonProps} from "components/atoms/Button";
import "./SubmitButton.scss";

interface SubmitButtonProps extends Omit<ButtonProps, "variant"> {
    /** Custom class name for the button's container. */
    containerClassName?: string;

    /** Error message to display above the button. */
    error?: string;

    /** Whether or not the button should show a loading state. */
    loading?: boolean;

    /** A variant to pass through to the button.
     *
     *  Note: Because Button and ShadowButton take different `variant` props, this prop
     *  is just a string that is passed through in `otherProps`. */
    variant?: string;

    /** A custom Button component to display in lieu of the `ShadowButton`. */
    Button?: React.ComponentType<Omit<ButtonProps, "variant">>;
}

/** A button that can be used to submit, for example, forms.
 *
 *  It supports showing an error message; useful for form wide error messages.
 *  It also has a loading state, so it can be the loading indicator for a form as well.
 *
 *  **Refer to `Button` for additional props.**
 */
const SubmitButton = ({
    className,
    containerClassName,
    error,
    loading,
    Button = ShadowButton,
    children,
    ...otherProps
}: SubmitButtonProps) => (
    <div className={classNames("SubmitButton-container", containerClassName)}>
        <TextField
            className={classNames("SubmitButton-TextField-error", {
                "SubmitButton-TextField-error--visible": !!error
            })}
        >
            {error}
        </TextField>

        <Button
            className={classNames(
                "SubmitButton",
                {"SubmitButton--loading": loading, "SubmitButton--error": !!error},
                className
            )}
            disabled={loading}
            type="submit"
            {...otherProps}
        >
            {loading ? null : children}
        </Button>

        <LoadingSpinner loading={loading} />
    </div>
);

export default SubmitButton;
