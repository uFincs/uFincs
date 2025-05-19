import classNames from "classnames";
import {useRef} from "react";
import * as React from "react";
import {CSSTransition} from "react-transition-group";
import {useOutsideCloseable} from "hooks/";
import {transitionShortLength as animationTime} from "utils/parsedStyles";
import "./DialogContainer.scss";

export interface DialogContainerProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not the dialog should be visible. */
    isVisible: boolean;

    /** Title of the dialog. Should convey intent in as few words as possible. */
    title: string;

    /** Handler for closing the dialog from the secondary action or the close button. */
    onClose: () => void;

    /** Children is where the body of the dialog is specified. */
    children: React.ReactNode;
}

/** The container for modal dialogs. Handles the base stylings and transitions. */
const DialogContainer = React.forwardRef(
    (
        {
            className,
            // Need to destructure isVisible to prevent passing to div under otherProps.
            isVisible: _isVisible,
            title,
            onClose,
            children,
            ...otherProps
        }: DialogContainerProps,
        ref
    ) => {
        const {
            closeableContainerProps: {ref: closeableRef}
        } = useOutsideCloseable<HTMLDivElement>(true, onClose);

        return (
            <div
                className={classNames("DialogContainer", className)}
                aria-label={title}
                aria-modal={true}
                role="dialog"
                title={title}
                ref={(e: HTMLDivElement) => {
                    closeableRef.current = e;

                    if (typeof ref === "function") {
                        ref(e);
                    } else if (ref) {
                        ref.current = e;
                    }
                }}
                {...otherProps}
            >
                {children}
            </div>
        );
    }
);

// Want the CSSTransition wrapping the main component so that `useOutsideCloseable` isn't
// outside the transition, where it'll always be present and fire for every keystroke.
const TransitionedDialogContainer = ({isVisible, ...otherProps}: DialogContainerProps) => {
    const transitionRef = useRef<HTMLDivElement | null>(null);

    return (
        <CSSTransition
            in={isVisible}
            nodeRef={transitionRef}
            timeout={animationTime}
            classNames="DialogContainer"
            unmountOnExit={true}
        >
            <DialogContainer isVisible={isVisible} {...otherProps} ref={transitionRef} />
        </CSSTransition>
    );
};

export default TransitionedDialogContainer;
