import classNames from "classnames";
import React, {useMemo} from "react";
import {ArrowNarrowRightIcon} from "assets/icons";
import {FormattedRuleAction, FormattedRuleCondition, ListItem} from "components/molecules";
import {ImportRuleAction, ImportRuleCondition} from "models/";
import {DefaultListItemActions, ListItemActions} from "utils/componentTypes";
import connect, {ConnectedProps} from "./connect";
import "./ImportRulesListItem.scss";

interface ImportRulesListItemProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The actions to show. Useful for hiding delete/edit during the import process. */
    actionsToShow?: ListItemActions;
}

/** A list item for the Import Rules list (mobile only). */
const ImportRulesListItem = React.memo(
    // Need to destructure `updatedAt` so that it doesn't get passed along to the underlying div,
    // causing React to yell at us.
    ({
        className,
        actionsToShow = DefaultListItemActions,
        actions,
        conditions,
        updatedAt,
        ...otherProps
    }: ImportRulesListItemProps) => {
        const sortedActions = useMemo(() => ImportRuleAction.sortByProperty(actions), [actions]);

        const sortedConditions = useMemo(
            () => ImportRuleCondition.sortByProperty(conditions),
            [conditions]
        );

        return (
            <ListItem
                className={classNames("ImportRulesListItem", className)}
                actionsToShow={actionsToShow}
                {...otherProps}
            >
                <div className="ImportRulesListItem-content" data-testid="import-rules-list-item">
                    <div className="ImportRulesListItem-conditions">
                        {sortedConditions.map((condition, index) => (
                            <FormattedRuleCondition
                                key={condition.id}
                                isLastItem={index === conditions.length - 1}
                                ruleCondition={condition}
                            />
                        ))}
                    </div>

                    <div className="ImportRulesListItem-actions-container">
                        <ArrowNarrowRightIcon />

                        <div className="ImportRulesListItem-actions">
                            {sortedActions.map((action, index) => (
                                <FormattedRuleAction
                                    key={action.id}
                                    isLastItem={index === actions.length - 1}
                                    ruleAction={action}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ListItem>
        );
    }
);

export const PureComponent = ImportRulesListItem;
export default connect(ImportRulesListItem);
