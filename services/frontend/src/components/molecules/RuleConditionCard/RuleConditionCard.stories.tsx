import {actions} from "@storybook/addon-actions";
import React from "react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import RuleConditionCard from "./RuleConditionCard";

export default {
    title: "Molecules/Rule Condition Card",
    component: RuleConditionCard
};

const cardActions = actions("onRemove");

/** The default view of `RuleConditionCard`. */
export const Default = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    const formMethods = useForm();

    return (
        <FormProvider {...formMethods}>
            <RuleConditionCard {...cardActions} />
        </FormProvider>
    );
});
