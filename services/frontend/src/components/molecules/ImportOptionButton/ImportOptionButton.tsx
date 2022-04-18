import classNames from "classnames";
import React from "react";
import {LargeButton} from "components/atoms";
import "./ImportOptionButton.scss";

interface ImportOptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Custom class name. */
    className?: string;

    /** An (optional) icon to show. */
    Icon?: React.ComponentType<{className?: string}>;

    /** The label for the button. */
    label: string;
}

/** The button used for displaying options for what types of things the user can import. */
const ImportOptionButton = ({className, Icon, label, ...otherProps}: ImportOptionButtonProps) => (
    <LargeButton
        className={classNames("ImportOptionButton", className)}
        title={label}
        {...otherProps}
    >
        {Icon && <Icon className="ImportOptionButton-icon" />}
        <span>{label}</span>
    </LargeButton>
);

export default ImportOptionButton;
