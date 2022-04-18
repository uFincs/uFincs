import classNames from "classnames";
import React, {useRef} from "react";
import {animated} from "react-spring";
import {CloseIcon} from "assets/icons";
import {CircularCountdown, IconButton, LinkButton, TextField} from "components/atoms";
import {useStopPropagationCallback, useOnActiveKey, useSwipeToClose} from "hooks/";
import "./SmallToast.scss";

interface SmallToastProps {
    /** Custom class name. */
    className?: string;

    /** Label for the optional toast action. */
    actionLabel?: string;

    /** Message to display. */
    message: string;

    /** Handler for the optional toast action. */
    onAction?: () => void;

    /** Handler for closing the toast. */
    onClose: () => void;
}

/** A toast that is small enough to have only a single message and an optional action button.
 *
 *  Note: These toasts are expected to be used inside a TransitionGroup. Hence why `otherProps`
 *        gets passed to CSSTransition instead of the div. */
const SmallToast = ({className, actionLabel, message, onAction, onClose}: SmallToastProps) => {
    const toastRef = useRef<HTMLDivElement>(null);
    const swipeProps = useSwipeToClose(onClose);

    const onCloseClick = useStopPropagationCallback(onClose);
    const onCloseKeyDown = useOnActiveKey(onCloseClick);

    const onActionClick = useStopPropagationCallback(onAction);
    const onActionKeydown = useOnActiveKey(onActionClick);

    return (
        <animated.div
            className={classNames("SmallToast", className)}
            aria-label={message}
            title={message}
            onClick={onCloseClick}
            onKeyDown={onCloseKeyDown}
            ref={toastRef}
            {...swipeProps}
        >
            <TextField className="SmallToast-message">{message}</TextField>

            <div className="SmallToast-actions">
                {actionLabel && onAction && (
                    <LinkButton
                        className="SmallToast-action"
                        onClick={onActionClick}
                        onKeyDown={onActionKeydown}
                        title={actionLabel}
                    >
                        {actionLabel}
                    </LinkButton>
                )}

                <IconButton
                    className="SmallToast-close-button"
                    title="Close"
                    onClick={onCloseClick}
                    onKeyDown={onCloseKeyDown}
                >
                    <CircularCountdown
                        pathClassName="SmallToast-countdown"
                        pauseRef={toastRef}
                        onTimesUp={onClose}
                    >
                        <CloseIcon />
                    </CircularCountdown>
                </IconButton>
            </div>
        </animated.div>
    );
};

export default SmallToast;
