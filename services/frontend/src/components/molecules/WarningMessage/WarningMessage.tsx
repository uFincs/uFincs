import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import "./WarningMessage.scss";

interface WarningMessageProps {
    /** Custom class name. */
    className?: string;

    /** Whatever to render as the message. */
    children: React.ReactNode;
}

/** A wrapper around a `TextField` that makes it look like a warning message. */
const WarningMessage = ({className, children}: WarningMessageProps) => (
    <TextField className={classNames("WarningMessage", className)}>{children}</TextField>
);

export default WarningMessage;
