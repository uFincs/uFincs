import classNames from "classnames";
import {JSX, useMemo} from "react";
import {ListSectionHeader} from "components/atoms";
import {EmptyImportRulesArea, ImportRulesListItem} from "components/molecules";
import {useTransformImportRulesList} from "hooks/";
import {ValueFormatting} from "services/";
import {DefaultListItemActions, ImportRulesViewProps, ListItemActions} from "utils/componentTypes";
import {
    AnimationProps,
    generateAnimatedList,
    generateAnimationCalculator,
    IndexCalculator
} from "utils/listAnimation";
import {Id} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import "./ImportRulesList.scss";

// This helper function is a bit overloaded in that it creates a function that generates
// the date headers as well as the deals with generating the animation styles (for the date header
// and the list item).
//
// Since it needs to do the animation calculations so that the date header can be animated,
// it totally only makes sense to also have it do it for the list item, right?
const generateDateHeaderGenerator = (indexCalculator: IndexCalculator) => {
    // Need to keep reference to the last date that was used; do this with a closure.
    let lastDate: string = "";

    return (date: string) => {
        let dateHeader: JSX.Element | null = null;

        // Need to handle the animation calculations in this function so that we can
        // get the right animation styles onto the date header, as well as know the correct
        // offset for the list item.
        let animationIndex: number = 0;
        let animationCalculator: ((offset: number) => AnimationProps) | null = null;

        if (date !== lastDate) {
            lastDate = date;

            // 2 because it's the date header + list item.
            animationIndex = indexCalculator(2);
            animationCalculator = generateAnimationCalculator(animationIndex);

            dateHeader = (
                <ListSectionHeader
                    key={date}
                    className="ImportRulesList-date-header"
                    style={animationCalculator(0)}
                >
                    {ValueFormatting.formatDate(date)}
                </ListSectionHeader>
            );
        } else {
            // 1 because it's only list item.
            animationIndex = indexCalculator(1);
            animationCalculator = generateAnimationCalculator(animationIndex);
        }

        return {
            dateHeader,

            // If we have a date header, then the rule is the 'second' item.
            ruleStyles: animationCalculator(dateHeader ? 1 : 0)
        };
    };
};

// Generates the list of (animated) items that are to be displayed.
// Should be passed to `generateAnimatedList`.
const generateListItems =
    ({
        dates,
        ids,
        actionsToShow
    }: {
        dates: Array<string>;
        ids: Array<Id>;
        actionsToShow: ListItemActions;
    }) =>
    (indexCalculator: IndexCalculator) => {
        const generateDateHeader = generateDateHeaderGenerator(indexCalculator);

        // It might seem strange that we're generating a 2D array to get a flat list of items
        // for React to render, but _that is_ how React renders it.
        const listItems: Array<Array<JSX.Element | null>> = [];

        for (let i = 0; i < ids.length; i++) {
            const date = dates[i];
            const id = ids[i];

            const {dateHeader, ruleStyles} = generateDateHeader(date);

            // As opposed to the AccountsList, where we have a separate AccountsListSection
            // component, we are just generating everything flat here using an array.
            //
            // We do this because the dates are dynamic; the AccountsList has the advantage
            // of knowing ahead of time that there are only so many types to generate
            // sections for.
            listItems.push([
                dateHeader,
                <ImportRulesListItem
                    key={id}
                    id={id}
                    actionsToShow={actionsToShow}
                    style={ruleStyles}
                />
            ]);
        }

        return listItems;
    };

interface ImportRulesListProps extends ConnectedProps, ImportRulesViewProps {}

/** A list of Import Rules. Used on sufficiently small screens, whereas the `ImportRulesTable`
 *  is used on larger displays. */
const ImportRulesList = ({
    className,
    actionsToShow = DefaultListItemActions,
    importRules = [],
    onAddRule,
    ...otherProps
}: ImportRulesListProps) => {
    const {ids, sortedRules} = useTransformImportRulesList(importRules);

    const rulesExist = ids.length > 0;
    const dates = useMemo(() => sortedRules.map(({updatedAt}) => updatedAt), [sortedRules]);

    const listItems = useMemo(
        () =>
            generateAnimatedList(
                generateListItems({
                    dates,
                    ids,
                    actionsToShow
                })
            ),
        // eslint-disable-next-line
        [JSON.stringify(dates), JSON.stringify(ids)]
    );

    return (
        <div className={classNames("ImportRulesList", className)} {...otherProps}>
            {rulesExist ? listItems : <EmptyImportRulesArea onAddRule={onAddRule} />}
        </div>
    );
};

export const PureComponent = ImportRulesList;
export const ConnectedImportRulesList = connect(ImportRulesList);
export default ConnectedImportRulesList;
