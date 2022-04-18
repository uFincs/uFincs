import classNames from "classnames";
import React, {useRef} from "react";
import {CSSTransition} from "react-transition-group";
import {useOutsideCloseable} from "hooks/";
import {transitionShortLength as animationTime} from "utils/parsedStyles";
import "./Sidebar.scss";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whether or not the `Sidebar` is visible. Is used by, for example, a Route to control
     *  visibility.
     *
     *  This prop is needed so that the CSSTransition can correctly control the transition. */
    isVisible: boolean;

    /** Callback to close the sidebar. */
    onClose: () => void;
}

/** A container for displaying things like forms as a modal sidebar. */
const Sidebar = React.forwardRef(
    ({className, children, onClose, ...otherProps}: Omit<SidebarProps, "isVisible">, ref) => {
        const {
            // Because the Sidebar container isn't focusable, we don't want the `onBlur` callback
            // as it would cause `onClose` to fire whenever anything inside the Sidebar
            // loses focus.
            closeableContainerProps: {ref: closeableRef}
        } = useOutsideCloseable<HTMLDivElement>(true, onClose);

        return (
            <div
                className={classNames("Sidebar", className)}
                role="dialog"
                aria-modal={true}
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

const TransitionedSidebar = ({isVisible, ...otherProps}: SidebarProps) => {
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    return (
        // Want the CSSTransition wrapping the main component so that `useOutsideCloseable` isn't
        // outside the transition, where it'll always be present and fire for every keystroke.
        <CSSTransition
            in={isVisible}
            nodeRef={sidebarRef}
            timeout={animationTime}
            classNames="Sidebar"
            unmountOnExit={true}
        >
            <Sidebar {...otherProps} ref={sidebarRef} />
        </CSSTransition>
    );
};

export default TransitionedSidebar;
