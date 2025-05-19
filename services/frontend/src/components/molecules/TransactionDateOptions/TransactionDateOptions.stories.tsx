import type {Meta, StoryObj} from "@storybook/react";
import {useForm, FormProvider} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import {DateOption} from "values/transactionForm";
import TransactionDateOptions from "./TransactionDateOptions";

const meta: Meta<typeof TransactionDateOptions> = {
    title: "Molecules/Transaction Date Options",
    component: TransactionDateOptions,
    render: storyUsingHooks((args) => {
        const methods = useForm();

        return (
            <FormProvider {...methods}>
                <TransactionDateOptions {...args} />
            </FormProvider>
        );
    })
};

export default meta;
type Story = StoryObj<typeof TransactionDateOptions>;

/** An example of how to use the `TransactionDateOptions` with react-hook-form. */
export const ReactHookForm: Story = {};

/** An example of showing only the 'one-off' option. */
export const OnlyOneOff: Story = {
    args: {
        options: [DateOption.oneOff]
    }
};

/** An example of showing only the 'recurring' option. */
export const OnlyRecurring: Story = {
    args: {
        options: [DateOption.recurring]
    }
};
