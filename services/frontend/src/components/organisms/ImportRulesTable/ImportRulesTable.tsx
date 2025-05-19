import classNames from "classnames";
import {useMemo} from "react";
import {
    EmptyImportRulesArea,
    ImportRulesTableColumnHeaders,
    ImportRulesTableRow
} from "components/molecules";
import {DefaultListItemActions, ImportRulesViewProps, ListItemActions} from "utils/componentTypes";
import {generateAnimatedList, generateAnimationCalculator} from "utils/listAnimation";
import {Id} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import {useImportRulesTable} from "./hooks";
import "./ImportRulesTable.scss";

/** Generates the (animated) rows for the table. */
const useGenerateRows = (ids: Array<Id>, actionsToShow: ListItemActions) =>
    useMemo(
        () =>
            generateAnimatedList((indexCalculator) =>
                ids.map((id, index) => {
                    const animationCalculator = generateAnimationCalculator(indexCalculator());

                    return (
                        <ImportRulesTableRow
                            key={id}
                            id={id}
                            index={index}
                            actionsToShow={actionsToShow}
                            style={animationCalculator()}
                        />
                    );
                })
            ),
        // Performance optimization. See TransactionsList.tsx for full explanation.
        // eslint-disable-next-line
        [JSON.stringify(ids)]
    );

interface ImportRulesTableProps extends ConnectedProps, ImportRulesViewProps {}

/** A table of import rules. Used on large screens, whereas the `ImportRulesList`
 *  is used on smaller displays. */
const ImportRulesTable = ({
    className,
    actionsToShow = DefaultListItemActions,
    importRules = [],
    onAddRule,
    ...otherProps
}: ImportRulesTableProps) => {
    const {ids, sortState, onSortChange} = useImportRulesTable(importRules);

    const rulesExist = ids.length > 0;
    const tableRows = useGenerateRows(ids, actionsToShow);

    return rulesExist ? (
        <table className={classNames("ImportRulesTable", className)} {...otherProps}>
            <thead className="ImportRulesTable-head">
                <ImportRulesTableColumnHeaders
                    sortBy={sortState.by}
                    sortDirection={sortState.direction}
                    onSortChange={onSortChange}
                />
            </thead>

            <tbody className="ImportRulesTable-body">{tableRows}</tbody>
        </table>
    ) : (
        // We need a div wrapping the empty area so that it can get the className prop
        // so that scenes that conditionally hide the table also conditionally hide the empty area.
        //
        // Otherwise we end up with something like two empty areas on mobile.
        <div className={classNames("ImportRulesTable", className)}>
            <EmptyImportRulesArea onAddRule={onAddRule} />
        </div>
    );
};

export const PureComponent = ImportRulesTable;
export const ConnectedImportRulesTable = connect(ImportRulesTable);
export default ConnectedImportRulesTable;
