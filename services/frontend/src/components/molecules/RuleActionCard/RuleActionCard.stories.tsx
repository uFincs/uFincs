import {Meta, StoryObj} from "@storybook/react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import RuleActionCard from "./RuleActionCard";

const meta: Meta<typeof RuleActionCard> = {
    title: "Molecules/Rule Action Card",
    component: RuleActionCard
};

export default meta;
type Story = StoryObj<typeof RuleActionCard>;

/** The default view of `RuleActionCard`. */
export const Default: Story = {
    args: {},
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);
        const formMethods = useForm();

        return (
            <FormProvider {...formMethods}>
                <RuleActionCard {...args} />
            </FormProvider>
        );
    })
};
