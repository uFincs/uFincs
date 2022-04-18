import classNames from "classnames";
import React, {useRef} from "react";
import {animated} from "react-spring";
import {CloseIcon, ErrorIcon, SuccessIcon, WarningIcon} from "assets/icons";
import {CircularCountdown, IconButton, TextField} from "components/atoms";
import {useStopPropagationCallback, useOnActiveKey, useSwipeToClose} from "hooks/";
import "./LargeToast.scss";

const variantIcon = {
    positive: SuccessIcon,
    warning: WarningIcon,
    negative: ErrorIcon
} as const;

interface LargeToastProps {
    /** Custom class name. */
    className?: string;

    /** Optional extended message to display. */
    message?: string;

    /** Title of the toast. Should convey intent in as few words as possible. */
    title: string;

    /** The type of toast. Changes the color theme and icon. */
    variant?: "positive" | "warning" | "negative";

    /** Handler for closing the toast. */
    onClose: () => void;
}

/** A toast that is large enough to have both a title and a secondary message.
 *
 *  Comes in three variants: positive, warning, and negative. The only differences between each
 *  variant is the icon and color theme used.
 *
 *  Note: These toasts are expected to be used inside a TransitionGroup. Hence why `otherProps`
 *        gets passed to CSSTransition instead of the div. */
const LargeToast = ({
    className,
    message = "",
    title,
    variant = "positive",
    onClose
}: LargeToastProps) => {
    const toastRef = useRef<HTMLDivElement>(null);
    const swipeProps = useSwipeToClose(onClose);

    const onCloseClick = useStopPropagationCallback(onClose);
    const onCloseKeyDown = useOnActiveKey(onCloseClick);

    const VariantIcon = variantIcon[variant];
    const label = `${title} ${message}`;

    return (
        <animated.div
            className={classNames("LargeToast", `LargeToast--${variant}`, className)}
            aria-label={label}
            title={label}
            tabIndex={0}
            onClick={onCloseClick}
            onKeyDown={onCloseKeyDown}
            ref={toastRef}
            {...swipeProps}
        >
            <VariantIcon className={classNames("LargeToast-icon", `LargeToast-icon--${variant}`)} />

            <div className="LargeToast-content">
                <h2 className="LargeToast-header">{title}</h2>

                {message && <TextField className="LargeToast-message">{message}</TextField>}
            </div>

            <IconButton
                className={classNames("LargeToast-close-button", {
                    "LargeToast-close-button--countdown": variant !== "negative"
                })}
                title="Close"
                onClick={onCloseClick}
                onKeyDown={onCloseKeyDown}
            >
                {variant === "negative" ? (
                    <CloseIcon />
                ) : (
                    // Don't want a countdown on errors, to give the user a better chance
                    // to read and deal with the error.
                    <CircularCountdown
                        pathClassName={`LargeToast-countdown--${variant}`}
                        pauseRef={toastRef}
                        onTimesUp={onClose}
                    >
                        <CloseIcon />
                    </CircularCountdown>
                )}
            </IconButton>
        </animated.div>
    );
};

export default LargeToast;
