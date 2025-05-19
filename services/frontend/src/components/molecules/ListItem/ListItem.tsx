import classNames from "classnames";
import {useCallback, useEffect, useRef} from "react";
import * as React from "react";
import {DeleteIcon, EditIcon, OverflowIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import {
    useLongPress,
    useOnActiveKey,
    useOutsideCloseable,
    useStopPropagationCallback
} from "hooks/";
import {DefaultListItemActions, ListItemActions as ListItemActionsType} from "utils/componentTypes";
import "./ListItem.scss";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The actions to show. */
    actionsToShow?: ListItemActionsType;

    /** Used by the single layer `ListItem` to indicate if it should look 'selected'. */
    active?: boolean;

    /** [only used by DoubleLayerListItem] Allows enabling the `onClick` handler even when
     *  `actionsToShow` is an empty array. This way, the 'double layer' list item can act
     *  as a single layer list item, just with different styling.
     *
     *  Used, for example, by the `SettingsListItem`. */
    enableOnClickWithNoActions?: boolean;

    /** Whether or not to use the single layer or double layer list item.
     *
     *  The single layer list item consists of the content with the actions in one layer.
     *
     *  The double layer list item consists of the actions hidden beneath the top content layer.
     */
    singleLayer?: boolean;

    /** Handler for clicking the list item itself. */
    onClick: () => void;

    /** Handler for deletion. */
    onDelete: () => void;

    /** Handler for editing. */
    onEdit: () => void;
}

interface ListItemActionsProps {
    /** Custom class name. */
    className?: string;

    /** The actions to show. */
    actionsToShow?: ListItemActionsType;

    /** Whether or not actions should be focusable (e.g. if the double layer ListItem is open). */
    isFocusable?: boolean;

    /** Handler for the Delete action. */
    onDelete: () => void;

    /** Handler for the Edit action. */
    onEdit: () => void;
}

/** The actions for a list item. Currently hard-coded to just Edit and Delete. */
const ListItemActions = ({
    className,
    actionsToShow = DefaultListItemActions,
    isFocusable = false,
    onDelete,
    onEdit
}: ListItemActionsProps) => {
    const onDeleteClick = useStopPropagationCallback(onDelete);
    const onEditClick = useStopPropagationCallback(onEdit);

    const onDeleteKeyDown = useOnActiveKey(onDeleteClick);
    const onEditKeyDown = useOnActiveKey(onEditClick);

    return (
        <div className={classNames("ListItemActions", className)}>
            {actionsToShow.includes("edit") && (
                <IconButton
                    className="ListItemActions-button"
                    data-testid="list-item-edit"
                    tabIndex={isFocusable ? 0 : -1}
                    title="Edit"
                    onClick={onEditClick}
                    onKeyDown={onEditKeyDown}
                >
                    <EditIcon />
                </IconButton>
            )}

            {actionsToShow.includes("delete") && (
                <IconButton
                    className="ListItemActions-button"
                    data-testid="list-item-delete"
                    tabIndex={isFocusable ? 0 : -1}
                    title="Delete"
                    onClick={onDeleteClick}
                    onKeyDown={onDeleteKeyDown}
                >
                    <DeleteIcon />
                </IconButton>
            )}
        </div>
    );
};

/** A list item that has a top and bottom layer. Used on mobile so that the actions are hidden
 *  in the bottom layer to give more real-estate for the content.
 */
const DoubleLayerListItem = React.forwardRef(
    (
        {
            className,
            actionsToShow,
            enableOnClickWithNoActions = false,
            onClick,
            onDelete,
            onEdit,
            onKeyDown,
            children,
            ...otherProps
        }: ListItemProps,
        ref: any
    ) => {
        const {
            closeableContainerProps: {ref: closeableRef, onBlur},
            isOpen,
            setIsOpen
        } = useOutsideCloseable<HTMLDivElement>(false);

        const noActions = actionsToShow !== undefined && actionsToShow.length === 0;

        const toggleOpen = useCallback(() => {
            if (!noActions) {
                setIsOpen((isOpen) => !isOpen);
            }
        }, [noActions, setIsOpen]);

        const longPressProps = useLongPress(toggleOpen);

        const onDeleteClick = useCallback(() => {
            setIsOpen(false);
            onDelete();
        }, [setIsOpen, onDelete]);

        const onEditClick = useCallback(() => {
            setIsOpen(false);
            onEdit();
        }, [setIsOpen, onEdit]);

        return (
            <div
                className={classNames(
                    "ListItem",
                    "ListItem-double-layer",
                    {
                        "ListItem--open": isOpen,
                        "ListItem--no-actions": !enableOnClickWithNoActions && noActions
                    },
                    className
                )}
                // To enable Vimium clickability.
                role="button"
                ref={(e: HTMLDivElement) => {
                    closeableRef.current = e;

                    if (ref) {
                        ref.current = e;
                    }
                }}
                onBlur={onBlur}
                {...otherProps}
            >
                <div
                    className="ListItem-top-layer"
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    onClick={onClick}
                    {...longPressProps}
                >
                    <div className="ListItem-content">{children}</div>
                </div>

                {!noActions && (
                    <>
                        {/* Need the overflow button outside the top layer so that it doesn't trigger
                            event handlers/active states on the top layer. */}
                        <div className="ListItem-overflow-button-container">
                            <IconButton
                                className="ListItem-overflow-button"
                                data-testid="list-item-overflow"
                                title="Show Actions"
                                onClick={toggleOpen}
                            >
                                <OverflowIcon className="ListItem-OverflowIcon" />
                            </IconButton>
                        </div>

                        <div className="ListItem-bottom-layer" aria-hidden={!isOpen}>
                            <ListItemActions
                                actionsToShow={actionsToShow}
                                isFocusable={isOpen}
                                onDelete={onDeleteClick}
                                onEdit={onEditClick}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    }
);

/** A list item that only has a single layer. Used on desktop so that the actions are visible
 *  since there's more room for the content.
 */
const SingleLayerListItem = React.forwardRef(
    (
        {
            className,
            actionsToShow,
            active = false,
            // Just destructuring so it doesn't get passed into the DOM under `otherProps`.
            enableOnClickWithNoActions: _enableOnClickWithNoActions = false,
            onClick,
            onDelete,
            onEdit,
            onKeyDown,
            children,
            ...otherProps
        }: ListItemProps,
        ref: any
    ) => {
        const itemRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            // When the item becomes active, we want to focus it. Obviously, this happens automatically
            // when clicking the item, but it needs to be done manually when navigating with the
            // keyboard.
            if (active) {
                itemRef?.current?.focus();
            }
        }, [active, itemRef]);

        return (
            <div
                className={classNames(
                    "ListItem",
                    "ListItem-single-layer",
                    {"ListItem--active": active},
                    className
                )}
                // Just like with something like the RadioGroup, we only want the active item
                // to be focusable. This way the user can focus out of the list easier and into
                // the next section, while still being able to navigate list items using arrow keys.
                tabIndex={active ? 0 : -1}
                onClick={onClick}
                onKeyDown={onKeyDown}
                ref={(e: HTMLDivElement) => {
                    itemRef.current = e;

                    if (ref) {
                        ref.current = e;
                    }
                }}
                // To enable Vimium clickability.
                role="button"
                {...otherProps}
            >
                <div className="ListItem-content">{children}</div>

                <ListItemActions
                    className={classNames({"ListItemActions--active": active})}
                    actionsToShow={actionsToShow}
                    isFocusable={active}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            </div>
        );
    }
);

/** An item that can be displayed in a list. */
const ListItem = React.forwardRef(
    (
        {
            singleLayer = false,
            active = false,
            onClick,
            onKeyDown,
            children,
            ...otherProps
        }: ListItemProps,
        ref: any
    ) => {
        // This is so the list item can be 'clicked' with Space and Enter.
        const onActiveKey = useOnActiveKey(onClick);

        const finalOnKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                onActiveKey(e);

                // One particular use of onKeyDown is higher abstractions using the keyboard
                // to navigate between list items. This is more relevant for the SingleLayerListItem
                // since it has an active state (whereas changing DoubleLayerListItems would just
                // change the entire page).
                if (onKeyDown) {
                    onKeyDown(e);
                }
            },
            [onActiveKey, onKeyDown]
        );

        return singleLayer ? (
            // Need to pass active only to the SingleLayerListItem, otherwise React complains
            // about it being put on a `div` in DoubleLayerListItem.
            <SingleLayerListItem
                active={active}
                onClick={onClick}
                onKeyDown={finalOnKeyDown}
                ref={ref}
                {...otherProps}
            >
                {children}
            </SingleLayerListItem>
        ) : (
            <DoubleLayerListItem
                onClick={onClick}
                onKeyDown={finalOnKeyDown}
                ref={ref}
                {...otherProps}
            >
                {children}
            </DoubleLayerListItem>
        );
    }
);

export default ListItem;
