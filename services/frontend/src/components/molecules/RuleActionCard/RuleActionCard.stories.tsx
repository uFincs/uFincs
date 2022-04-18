import {actions} from "@storybook/addon-actions";
import React from "react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import RuleActionCard from "./RuleActionCard";

export default {
    title: "Molecules/Rule Action Card",
    component: RuleActionCard
};

const cardActions = actions("onRemove");

/** The default view of `RuleActionCard`. */
export const Default = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    const formMethods = useForm();

    return (
        <FormProvider {...formMethods}>
            <RuleActionCard {...cardActions} />
        </FormProvider>
    );
});
