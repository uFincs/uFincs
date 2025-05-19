import {Meta, StoryObj} from "@storybook/react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import RuleConditionCard from "./RuleConditionCard";

const meta: Meta<typeof RuleConditionCard> = {
    title: "Molecules/Rule Condition Card",
    component: RuleConditionCard
};

export default meta;
type Story = StoryObj<typeof RuleConditionCard>;

/** The default view of `RuleConditionCard`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);
        const formMethods = useForm();

        return (
            <FormProvider {...formMethods}>
                <RuleConditionCard {...args} />
            </FormProvider>
        );
    })
};
