import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import {PureComponent as ActiveImportRules} from "./ActiveImportRules";

export default {
    title: "Organisms/Active Import Rules",
    component: ActiveImportRules
};

const ruleActions = actions("onAddRule", "onToggleRules");
const enabledKnob = () => boolean("Are Rules Enabled", true);

/** The default view of `ActiveImportRules`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return (
        <ActiveImportRules areRulesEnabled={enabledKnob()} importRules={rules} {...ruleActions} />
    );
});

/** The small view of `ActiveImportRules`. */
export const Small = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return (
        <ActiveImportRules areRulesEnabled={enabledKnob()} importRules={rules} {...ruleActions} />
    );
});

Small.parameters = smallViewport;

/** The empty view of `ActiveImportRules`. */
export const Empty = storyUsingRedux(() => {
    useCreateImportRules();

    return <ActiveImportRules areRulesEnabled={enabledKnob()} importRules={[]} {...ruleActions} />;
});
