import classNames from "classnames";
import * as React from "react";
import "./OptionCard.scss";

export interface OptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whether or not this option is the currently 'active' or 'selected' option. */
    active?: boolean;

    /** Whether or not this option should appear disabled. */
    disabled?: boolean;
}

/** An `OptionCard` is basically a button that can act as a custom radio button or checkbox.
 *
 *  Just use it inside something like a `RadioGroup` and it's all good to go.
 *
 *  Note that, because the `OptionCard` is _expected_ to be used in something like a
 *  `RadioGroup`, there are certain things that the `OptionCard` doesn't handle. For example,
 *  certain accessibility attributes are delegated to the `RadioGroup`.
 */
const OptionCard = React.forwardRef(
    (
        {className, active, disabled, children, ...otherProps}: OptionCardProps,
        ref: React.Ref<HTMLDivElement>
    ) => (
        <div
            className={classNames(
                "OptionCard",
                // This is literally just for Vimium clickability.
                "OptionCard-button",
                {"OptionCard--active": active, "OptionCard--disabled": disabled},
                className
            )}
            aria-disabled={disabled}
            ref={ref}
            {...otherProps}
        >
            {children}
        </div>
    )
);

export default OptionCard;
