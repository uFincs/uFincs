import type {Meta, StoryObj} from "@storybook/react";
import {ImportRuleCondition} from "models/";
import FormattedRuleCondition from "./FormattedRuleCondition";

const meta: Meta<typeof FormattedRuleCondition> = {
    title: "Molecules/Formatted Rule Condition",
    component: FormattedRuleCondition,
    args: {
        isLastItem: false,
        ruleCondition: new ImportRuleCondition({
            condition: ImportRuleCondition.CONDITION_MATCHES,
            property: ImportRuleCondition.PROPERTY_DESCRIPTION,
            value: "Apple"
        })
    }
};

export default meta;
type Story = StoryObj<typeof FormattedRuleCondition>;

/** The default view of `FormattedRuleCondition`. */
export const Default: Story = {};
