import classNames from "classnames";
import React, {useCallback} from "react";
import {animated, useSpring} from "react-spring";
import {useOnActiveKey} from "hooks/";
import {colors} from "utils/styles";
import "./ListItemCheckbox.scss";

type CheckboxVariant = "primary" | "positive";

// This value was found by running `getTotalLength()` on the `path` element.
const CHECK_PATH_LENGTH = 20;

// This is a pretty fast animation config. We want it fast since animating
// the checkbox is very much a micro interaction.
const config = {
    mass: 1,
    tension: 500,
    friction: 40
};

/* Hooks */

const useAnimatedCheckbox = (checked?: boolean, variant?: CheckboxVariant) => {
    const mainColor = (() => {
        switch (variant) {
            case "positive":
                return colors.colorPositive600;
            case "primary":
            // Falls through.
            default:
                return colors.colorPrimary600;
        }
    })();

    const {background, border} = useSpring({
        // Animate in the background color and border color.
        background: checked ? mainColor : "rgba(255, 255, 255, 0)",
        border: checked ? mainColor : colors.colorNeutral400,
        config
    });

    const {path} = useSpring({
        // Animate the checkmark path so that it 'swishes'.
        path: checked ? 0 : CHECK_PATH_LENGTH,
        // Need to delay the checkmark animation slightly, so that its start is visible
        // over the background animation.
        delay: 100,
        config
    });

    const containerProps = {
        style: {
            backgroundColor: background,
            borderColor: border
        } as any
    };

    const pathProps = {
        stroke: checked ? colors.colorLight : mainColor,
        strokeDasharray: CHECK_PATH_LENGTH,
        strokeDashoffset: path
    };

    return {containerProps, pathProps};
};

/* Component */

interface ListItemCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Custom class name. */
    className?: string;

    /** Handler for checking the checkbox. */
    onCheck: (isChecked: boolean) => void;

    /** The 'primary' variant uses the classic 'primary' color, whereas
     *  the 'positive' variant uses the positive (green) color. */
    variant?: CheckboxVariant;
}

/** A custom designed checkbox (unlike the regular Checkbox atom) that is used on list items.
 *  And by 'list item', I mean just the `SelectableAccountsListItem` (so far).
 *
 *  Can also be used as a "Success Indicator" of sorts by using the "positive" variant.
 *
 *  The `TransactionsListItem` uses a custom 'checkbox' in the form of the `TransactionTypeIcon`.
 *  However, unlike the `TransactionTypeIcon`, this `ListItemCheckbox` doesn't flip. */
const ListItemCheckbox = ({
    className,
    checked,
    role = "checkbox",
    tabIndex = 0,
    variant = "primary",
    onCheck,
    ...otherProps
}: ListItemCheckboxProps) => {
    const {containerProps, pathProps} = useAnimatedCheckbox(checked, variant);

    const onClick = useCallback(() => onCheck(!checked), [checked, onCheck]);
    const onKeyDown = useOnActiveKey(onClick);

    return (
        <animated.div
            className={classNames("ListItemCheckbox", className)}
            aria-checked={checked}
            role={role}
            tabIndex={tabIndex}
            onClick={onClick}
            onKeyDown={onKeyDown}
            {...containerProps}
            {...otherProps}
        >
            {/* This is the `CheckIcon` */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <animated.path
                    d="M5 13L9 17L19 7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...pathProps}
                />
            </svg>
        </animated.div>
    );
};

export default ListItemCheckbox;
