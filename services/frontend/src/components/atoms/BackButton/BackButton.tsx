import classNames from "classnames";
import React from "react";
import {ArrowLeftIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import "./BackButton.scss";

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/** An icon button with the back ('<-') icon. */
const BackButton = ({className, ...otherProps}: BackButtonProps) => (
    <IconButton className={classNames("BackButton", className)} title="Back" {...otherProps}>
        <ArrowLeftIcon />
    </IconButton>
);

export default BackButton;
