import classNames from "classnames";
import {DeleteIcon, EditIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import {DefaultListItemActions, ListItemActions} from "utils/componentTypes";
import {useActionInteractions} from "./hooks";
import "./TableRowActions.scss";

interface TableRowActionsProps {
    /** Custom class name. */
    className?: string;

    /** The set of actions to show. Order doesn't matter. */
    actionsToShow?: ListItemActions;

    /** The `data-testid` of the Delete action. */
    deleteTestId?: string;

    /** The `title` tooltip of the Delete action. */
    deleteTooltip?: string;

    /** The `data-testid` of the Edit action. */
    editTestId?: string;

    /** The `title` tooltip of the Edit action. */
    editTooltip?: string;

    /** Handler for the Delete action. */
    onDelete: () => void;

    /** Handler for the Edit action. */
    onEdit: () => void;
}

/** The set of actions to show on a row in a table. Currently supports Edit and Delete. */
const TableRowActions = ({
    className,
    actionsToShow = DefaultListItemActions,
    deleteTestId,
    deleteTooltip = "Delete",
    editTestId,
    editTooltip = "Edit",
    onDelete,
    onEdit
}: TableRowActionsProps) => {
    const {onDeleteClick, onDeleteKeyDown, onEditClick, onEditKeyDown} = useActionInteractions(
        onDelete,
        onEdit
    );

    return (
        <td className={classNames("TableRowActions", className)}>
            {actionsToShow.includes("edit") && (
                <IconButton
                    className="TableRowActions-edit"
                    data-testid={editTestId}
                    title={editTooltip}
                    onClick={onEditClick}
                    onKeyDown={onEditKeyDown}
                >
                    <EditIcon />
                </IconButton>
            )}

            {actionsToShow.includes("delete") && (
                <IconButton
                    className="TableRowActions-delete"
                    data-testid={deleteTestId}
                    title={deleteTooltip}
                    onClick={onDeleteClick}
                    onKeyDown={onDeleteKeyDown}
                >
                    <DeleteIcon />
                </IconButton>
            )}
        </td>
    );
};

export default TableRowActions;
