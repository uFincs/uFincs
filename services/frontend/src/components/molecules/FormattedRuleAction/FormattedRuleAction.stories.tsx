import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {ImportRuleAction} from "models/";
import {storyData, storyUsingRedux, useCreateAccounts} from "utils/stories";
import FormattedRuleAction from "./FormattedRuleAction";

export default {
    title: "Molecules/Formatted Rule Action",
    component: FormattedRuleAction
};

const lastItemKnob = () => boolean("Is Last Item", false);

/** The default view of `FormattedRuleAction`. */
export const Default = () => (
    <FormattedRuleAction
        isLastItem={lastItemKnob()}
        ruleAction={
            new ImportRuleAction({property: ImportRuleAction.PROPERTY_DESCRIPTION, value: "Apple"})
        }
    />
);

/** Ensures that it can pull in connected accounts to display account names rather than IDs.  */
export const AccountProperty = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);

    return (
        <FormattedRuleAction
            isLastItem={lastItemKnob()}
            ruleAction={
                new ImportRuleAction({
                    property: ImportRuleAction.PROPERTY_ACCOUNT,
                    value: storyData.accounts[0].id
                })
            }
        />
    );
});
