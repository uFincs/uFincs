import classNames from "classnames";
import {ChevronDownIcon} from "assets/icons";
import {useOnActiveKey} from "hooks/";
import {TableSortDirection} from "utils/types";
import "./TableColumnHeader.scss";

interface TableColumnHeaderProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not to disable the sorting ability of this header. */
    disableSort?: boolean;

    /** Whether or not this header is the currently active sort option. */
    isActiveSort: boolean;

    /** The direction of sorting. */
    sortDirection: TableSortDirection;

    /** The text to display in the header. */
    text: string;

    /** Handler for clicking the header. */
    onClick: () => void;
}

/** A single table column header component. */
const TableColumnHeader = ({
    className,
    disableSort = false,
    isActiveSort,
    sortDirection,
    text,
    onClick,
    ...otherProps
}: TableColumnHeaderProps) => {
    const onKeyDown = useOnActiveKey(onClick);

    return (
        <th
            className={classNames(
                "TableColumnHeader",
                {"TableColumnHeader--no-sort": disableSort},
                className
            )}
            aria-hidden={text === ""}
            aria-label={text}
            tabIndex={text === "" ? -1 : 0}
            title={
                // Yes, it is kinda jank to hard code this edge case for the Running Balance column.
                // Why do you ask?
                text === "Balance"
                    ? "Account balance after transaction\n(sort by Date to sort the Balance)"
                    : text
            }
            onClick={onClick}
            onKeyDown={onKeyDown}
            {...otherProps}
        >
            <span>{text}</span>

            {isActiveSort && (
                <ChevronDownIcon
                    className={classNames("TableColumnHeader-sort-icon", {
                        "TableColumnHeader-sort-icon--asc": sortDirection === "asc"
                    })}
                />
            )}

            {/* Note: The comma is a separate element as opposed to an ::after element because
            ::after is in use by the keyboard-navigation-outline. */}
            <span className="TableColumnHeader-comma" aria-hidden={true}>
                ,
            </span>
        </th>
    );
};

export default TableColumnHeader;
