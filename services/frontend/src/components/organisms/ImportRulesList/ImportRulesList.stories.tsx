import {actions} from "@storybook/addon-actions";
import React from "react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import {PureComponent as PureImportRulesList} from "./ImportRulesList";

export default {
    title: "Organisms/Import Rules List",
    component: PureImportRulesList
};

const listActions = actions("onAddRule");

/** The default view of `ImportRulesList`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();
    return <PureImportRulesList importRules={rules} {...listActions} />;
});

/** The empty view of `ImportRulesList`. */
export const Empty = storyUsingRedux(() => {
    return <PureImportRulesList importRules={[]} {...listActions} />;
});

/** The small view of the `TransactionsList`. */
export const Small = storyUsingRedux(() => {
    const rules = useCreateImportRules();
    return <PureImportRulesList importRules={rules} {...listActions} />;
});

Small.parameters = smallViewport;
