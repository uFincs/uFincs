import classNames from "classnames";
import React from "react";
import {ChevronRightIcon} from "assets/icons";
import {TextField} from "components/atoms";
import {ListItem} from "components/molecules";
import {ListItemProps} from "components/molecules/ListItem";
import {useKeyboardNavigation} from "hooks/";
import "./SettingsListItem.scss";

// Need a constant reference function for the no-op `onDelete` and `onEdit` handlers.
const NO_OP = () => {};

// NEed a constant reference empty array for the `actionsToShow`.
const ACTIONS_TO_SHOW: never[] = [];

interface SettingsListItemProps extends Omit<ListItemProps, "singleLayer" | "onDelete" | "onEdit"> {
    /** The description of the navigation item (used only on mobile). */
    description?: string;

    /** Whether or not to use the desktop layout (as opposed to the mobile layout). */
    desktopLayout?: boolean;

    /** An (optional) custom icon element to use in place of the right chevron.
     *  Can be used to specify the logout icon for the Logout item. */
    icon?: JSX.Element;

    /** The title of the navigation item (used on both desktop and mobile). */
    title: string;

    /** Handler for navigating to the first item in the list. Used for keyboard navigation. */
    onFirstItem?: () => void;

    /** Handler for navigating to the last item in the list. Used for keyboard navigation. */
    onLastItem?: () => void;

    /** Handler for navigating to the previous item in the list. Used for keyboard navigation. */
    onPreviousItem?: () => void;

    /** Handler for navigating to the next item in the list. Used for keyboard navigation. */
    onNextItem?: () => void;
}

/** A list item for the Navigation used in the User Settings (mobile or desktop). */
const SettingsListItem = ({
    className,
    description,
    desktopLayout = false,
    icon,
    title,
    onFirstItem,
    onLastItem,
    onPreviousItem,
    onNextItem,
    ...otherProps
}: SettingsListItemProps) => {
    const onKeyDown = useKeyboardNavigation({
        onFirst: onFirstItem,
        onLast: onLastItem,
        onPrevious: onPreviousItem,
        onNext: onNextItem
    });

    return (
        <ListItem
            className={classNames(
                "SettingsListItem",
                {
                    "SettingsListItem-desktop-layout": desktopLayout,
                    "SettingsListItem-mobile-layout": !desktopLayout
                },
                className
            )}
            aria-label={title}
            title={title}
            actionsToShow={ACTIONS_TO_SHOW}
            enableOnClickWithNoActions={true}
            singleLayer={desktopLayout}
            onDelete={NO_OP}
            onEdit={NO_OP}
            onKeyDown={onKeyDown}
            {...otherProps}
        >
            <div className="SettingsListItem-content" data-testid="settings-list-item">
                <div className="SettingsListItem-content-body">
                    <TextField className="SettingsListItem-title">{title}</TextField>

                    {!desktopLayout && description && (
                        <TextField className="SettingsListItem-description">
                            {description}
                        </TextField>
                    )}
                </div>

                {!desktopLayout &&
                    (icon ? icon : <ChevronRightIcon className="SettingsListItem-icon" />)}
            </div>
        </ListItem>
    );
};

export default SettingsListItem;
