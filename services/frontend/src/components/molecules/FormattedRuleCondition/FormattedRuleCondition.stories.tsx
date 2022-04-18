import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {ImportRuleCondition} from "models/";
import FormattedRuleCondition from "./FormattedRuleCondition";

export default {
    title: "Molecules/Formatted Rule Condition",
    component: FormattedRuleCondition
};

const lastItemKnob = () => boolean("Is Last Item", false);

/** The default view of `FormattedRuleCondition`. */
export const Default = () => (
    <FormattedRuleCondition
        isLastItem={lastItemKnob()}
        ruleCondition={
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_MATCHES,
                property: ImportRuleCondition.PROPERTY_DESCRIPTION,
                value: "Apple"
            })
        }
    />
);
