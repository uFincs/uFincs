import classNames from "classnames";
import {useMemo} from "react";
import * as React from "react";
import {ArrowNarrowRightIcon} from "assets/icons";
import {
    FormattedRuleAction,
    FormattedRuleCondition,
    TableRowActions,
    TableRowContainer
} from "components/molecules";
import {ImportRuleAction, ImportRuleCondition} from "models/";
import {DefaultListItemActions, ListItemActions} from "utils/componentTypes";
import connect, {ConnectedProps} from "./connect";
import {useImportRulesTableRow} from "./hooks";
import "./ImportRulesTableRow.scss";

export interface ImportRulesTableRowProps extends ConnectedProps {
    /** The actions to show. Useful for hiding delete/edit during the import process. */
    actionsToShow?: ListItemActions;

    /** Index of the row in the current page of the table; used for maintaining focus
     *  between page switches. */
    index?: number;

    /** Explicit style prop for the animation styles that are passed in from the table. */
    style?: React.CSSProperties;
}

/** A single row of the TransactionsTable. Has all of the columns of data, with a compressed
 *  view for when the table is used in constrained widths. */
const ImportRulesTableRow = ({
    className,
    style,
    actionsToShow = DefaultListItemActions,
    index,
    id,
    actions,
    conditions,
    updatedAt,
    onClick,
    onDelete,
    onEdit
}: ImportRulesTableRowProps) => {
    const {formattedDate, onRowClick, onKeyDown} = useImportRulesTableRow({
        index,
        id,
        updatedAt,
        onClick
    });

    const sortedActions = useMemo(() => ImportRuleAction.sortByProperty(actions), [actions]);

    const sortedConditions = useMemo(
        () => ImportRuleCondition.sortByProperty(conditions),
        [conditions]
    );

    return (
        <TableRowContainer
            className={classNames("ImportRulesTableRow", className)}
            data-testid="import-rules-table-row"
            index={index}
            style={style}
            onClick={onRowClick}
            onKeyDown={onKeyDown}
        >
            <td className="ImportRulesTableRow-date" title={formattedDate}>
                {formattedDate}
            </td>

            <td className="ImportRulesTableRow-rule">
                <div className="ImportRulesTableRow-rule-conditions">
                    {sortedConditions.map((condition, index) => (
                        <FormattedRuleCondition
                            key={condition.id}
                            isLastItem={index === conditions.length - 1}
                            ruleCondition={condition}
                        />
                    ))}
                </div>

                <div className="ImportRulesTableRow-rule-actions-container">
                    <ArrowNarrowRightIcon />

                    <div className="ImportRulesTableRow-rule-actions">
                        {sortedActions.map((action, index) => (
                            <FormattedRuleAction
                                key={action.id}
                                isLastItem={index === actions.length - 1}
                                ruleAction={action}
                            />
                        ))}
                    </div>
                </div>
            </td>

            <TableRowActions
                className="ImportRulesTableRow-actions"
                actionsToShow={actionsToShow}
                deleteTestId="import-rules-table-row-delete"
                editTestId="import-rules-table-row-edit"
                onDelete={onDelete}
                onEdit={onEdit}
            />
        </TableRowContainer>
    );
};

export const PureComponent = ImportRulesTableRow;
export const ConnectedImportRulesTableRow = connect(ImportRulesTableRow);
export default ConnectedImportRulesTableRow;
