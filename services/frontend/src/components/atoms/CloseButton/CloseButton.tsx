import classNames from "classnames";
import {CloseIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import {IconButtonProps} from "components/atoms/IconButton";
import "./CloseButton.scss";

interface CloseButtonProps extends IconButtonProps {}

/** An icon button with the close ('X') icon. Used in things like forms and modals. */
const CloseButton = ({className, ...otherProps}: CloseButtonProps) => (
    <IconButton className={classNames("CloseButton", className)} title="Close" {...otherProps}>
        <CloseIcon />
    </IconButton>
);

export default CloseButton;
