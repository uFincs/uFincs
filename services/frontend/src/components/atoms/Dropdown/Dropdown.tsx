import classNames from "classnames";
import React from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";
import {Button} from "components/atoms";
import {useEscapeKeyCloseable} from "hooks/";
import KeyCodes from "values/keyCodes";
import "./Dropdown.scss";

interface Item {
    /** An optional icon to display next to the label. */
    Icon?: React.ComponentType<{className?: string}>;

    /** Whether or not this particular is item is disabled (can't be clicked or activated). */
    disabled?: boolean;

    /** The label to display for the item. */
    label: string;

    /** An optional link to replace the onClick handler. */
    link?: string;

    /** The function to trigger when the item is clicked. */
    onClick?: Function;
}

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Custom class name. */
    className?: string;

    /** Custom test ID for Cypress. */
    "data-testid"?: string;

    /** The button component that is used to trigger opening/closing the dropdown. */
    TriggerButton?: React.ComponentType<any>;

    /** Which side the dropdown should be aligned with the button. Can be `left` or `right. */
    alignment?: "left" | "right" | "top-center";

    /** Whether or not the dropdown (specifically, its TriggerButton) is disabled. */
    disabled?: boolean;

    /** The `DropdownItem`s to show. */
    items: Array<Item>;
}

/** A dropdown for providing things like navigation menus.
 *
 *  Can provide a custom `TriggerButton` to open and close the dropdown.
 */
const Dropdown = ({
    className,
    "data-testid": dataTestId,
    TriggerButton = Button,
    alignment = "left",
    disabled = false,
    items,
    ...otherProps
}: DropdownProps) => {
    const {buttonProps, itemProps, isOpen, setIsOpen} = useDropdownMenu(items.length);

    // useDropdownMenu only handles the Escape key when an item is focused.
    // As such, when the user clicks on the TriggerButton, the TriggerButton is still focused.
    // Therefore, this hook enables pressing Escape after clicking the trigger to close the menu.
    useEscapeKeyCloseable(isOpen, () => setIsOpen(false));

    // Need a wrapper so that clicking on an item closes the dropdown.
    // For some reason, it doesn't do this by default.
    // (but hitting Enter on an item will close it :thinking-face:)
    const itemOnClickWrapper = (onClick: Function) => () => {
        onClick();
        setIsOpen(false);
    };

    return (
        <div className={classNames("Dropdown-container", className)}>
            <TriggerButton
                {...buttonProps}
                disabled={disabled}
                data-testid={`${dataTestId}-trigger`}
            />

            <div
                className={classNames("Dropdown", `Dropdown--aligned-${alignment}`, {
                    "Dropdown--open": isOpen
                })}
                data-testid={dataTestId}
                role="menu"
                {...otherProps}
            >
                {items.map(({Icon, disabled = false, label, link, onClick}, index) => {
                    const {onKeyDown, ...otherItemProps} = itemProps[index];

                    const customOnKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
                        // Need to disable the Enter key handler when the item is disabled.
                        // Still need the handler for other keys, however, since the user still needs
                        // up/down arrow keys to navigate between the items.
                        if (
                            e?.keyCode !== KeyCodes.ENTER ||
                            (e?.keyCode === KeyCodes.ENTER && !disabled)
                        ) {
                            onKeyDown(e);
                        }
                    };

                    return (
                        // Needs to be an anchor tag instead of a button because the `itemProps`
                        // are typed with a ref for HTMLAnchorElement instead of HTMLButtonElement.
                        <a
                            className={classNames("DropdownItem", {
                                "DropdownItem--has-icon": !!Icon,
                                "DropdownItem--disabled": disabled
                            })}
                            key={label}
                            aria-disabled={disabled}
                            href={link}
                            onClick={disabled || !onClick ? undefined : itemOnClickWrapper(onClick)}
                            onKeyDown={customOnKeyDown}
                            {...otherItemProps}
                        >
                            <div className="DropdownItem-content">
                                {Icon && <Icon className="DropdownItem-icon" />}
                                {label}
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default Dropdown;
