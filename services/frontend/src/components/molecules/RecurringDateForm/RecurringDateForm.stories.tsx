import type {Meta, StoryObj} from "@storybook/react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import RecurringDateForm from "./RecurringDateForm";

const meta: Meta<typeof RecurringDateForm> = {
    title: "Molecules/Recurring Date Form",
    component: RecurringDateForm
};

export default meta;
type Story = StoryObj<typeof RecurringDateForm>;

/** The default view of `RecurringDateForm`. */
export const Default: Story = {
    render: storyUsingHooks((args) => {
        const methods = useForm();

        return (
            <FormProvider {...methods}>
                <RecurringDateForm {...args} />
            </FormProvider>
        );
    })
};
