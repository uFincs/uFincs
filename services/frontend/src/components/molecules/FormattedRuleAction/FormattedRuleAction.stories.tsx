import type {Meta, StoryObj} from "@storybook/react";
import {ImportRuleAction} from "models/";
import {storyData, storyUsingRedux, useCreateAccounts} from "utils/stories";
import FormattedRuleAction from "./FormattedRuleAction";

const meta: Meta<typeof FormattedRuleAction> = {
    title: "Molecules/Formatted Rule Action",
    component: FormattedRuleAction,
    args: {
        isLastItem: false
    }
};

export default meta;

type Story = StoryObj<typeof FormattedRuleAction>;

/** The default view of `FormattedRuleAction`. */
export const Default: Story = {
    args: {
        ruleAction: new ImportRuleAction({
            property: ImportRuleAction.PROPERTY_DESCRIPTION,
            value: "Apple"
        })
    }
};

/** Ensures that it can pull in connected accounts to display account names rather than IDs. */
export const AccountProperty: Story = {
    args: {
        ruleAction: new ImportRuleAction({
            property: ImportRuleAction.PROPERTY_ACCOUNT,
            value: storyData.accounts[0].id
        })
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);

        return <FormattedRuleAction {...args} />;
    })
};
