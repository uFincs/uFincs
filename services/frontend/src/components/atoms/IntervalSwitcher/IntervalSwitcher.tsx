import classNames from "classnames";
import * as React from "react";
import {animated} from "react-spring";
import {useDrag} from "react-use-gesture";
import {ChevronLeftIcon, ChevronRightIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import debounce from "utils/debounce";
import "./IntervalSwitcher.scss";

interface IntervalSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whether or not the entire IntervalSwitcher should be disabled.
     *
     *  This means the increment/decrement buttons and the keyboard navigation get disabled. */
    disabled?: boolean;

    /** Props for the decrement button. This way the consumer can pass along whatever they need. */
    decrementButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;

    /** Props for the increment button. This way the consumer can pass along whatever they need. */
    incrementButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;

    /** Make children mandatory. */
    children: React.ReactNode;
}

/** A container that contains buttons for incrementing/decrementing values.
 *
 *  Can be used for things like pagination or date range switchers. */
const IntervalSwitcher = ({
    className,
    children,
    disabled,
    decrementButtonProps,
    incrementButtonProps,
    ...otherProps
}: IntervalSwitcherProps) => {
    const bind = useDrag(
        debounce(({direction: [xDirection], vxvy: [vx]}) => {
            if (Math.abs(vx) > 0.1) {
                if (xDirection < 0) {
                    // onClick normally expects an event; just chuck it whatever, since we shouldn't
                    // be passing in handlers that actually expect events anyways.
                    incrementButtonProps?.onClick?.(undefined as any);
                } else {
                    decrementButtonProps?.onClick?.(undefined as any);
                }
            }
        }, 100)
    );

    return (
        // Make this a nav for accessibility reasons.
        <animated.nav
            className={classNames("IntervalSwitcher", className)}
            // Make the switcher focusable so that it's easier to execute to keyboard nav on it.
            // If we didn't, then only the buttons would be focusable. And since they can get
            // disabled, it's annoying for the user to have to focus to the other button to be able to
            // execute any keyboard nav commands.
            tabIndex={disabled ? -1 : 0}
            {...otherProps}
            {...(bind() as any)}
        >
            <IconButton
                {...decrementButtonProps}
                className={classNames("IntervalSwitcher-button", decrementButtonProps?.className)}
                data-testid="interval-switcher-decrement"
                // The buttons can be disabled at the IntervalSwitcher level or at the button level.
                // This way, they can be disabled all at once or individually.
                disabled={disabled || decrementButtonProps.disabled}
            >
                <ChevronLeftIcon />
            </IconButton>

            {children}

            <IconButton
                {...incrementButtonProps}
                className={classNames("IntervalSwitcher-button", incrementButtonProps?.className)}
                data-testid="interval-switcher-increment"
                disabled={disabled || incrementButtonProps.disabled}
            >
                <ChevronRightIcon />
            </IconButton>
        </animated.nav>
    );
};

export default IntervalSwitcher;
