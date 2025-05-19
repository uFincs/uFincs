import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {TransactionsSearchProvider} from "hooks/";
import {storyData, storyUsingRedux, useCreateTransactions} from "utils/stories";
import TransactionsAutocompleteInput from "./TransactionsAutocompleteInput";

const meta: Meta<typeof TransactionsAutocompleteInput> = {
    title: "Molecules/Transactions Autocomplete Input",
    component: TransactionsAutocompleteInput,
    args: {
        label: "Description",
        placeholder: "e.g. Bought some"
    }
};

export default meta;
type Story = StoryObj<typeof TransactionsAutocompleteInput>;

/** An example of how to use the `TransactionsAutocompleteInput` controlled
 *  (e.g. with react-hook-form). */
export const Uncontrolled: Story = {
    render: storyUsingRedux((args) => {
        useCreateTransactions(storyData.transactions);

        const {control} = useForm();

        return (
            <TransactionsSearchProvider>
                <Controller
                    control={control}
                    defaultValue=""
                    name="description"
                    render={({value, onChange}) => (
                        <TransactionsAutocompleteInput
                            {...args}
                            value={value.label}
                            onInputValueChange={onChange}
                        />
                    )}
                />
            </TransactionsSearchProvider>
        );
    })
};

/** An example of how to use the `TransactionsAutocompleteInput` controlled. */
export const Controlled: Story = {
    render: storyUsingRedux((args) => {
        useCreateTransactions(storyData.transactions);

        const [value, setValue] = useState("");

        return (
            <TransactionsSearchProvider>
                <TransactionsAutocompleteInput
                    {...args}
                    value={value}
                    onInputValueChange={setValue}
                />
            </TransactionsSearchProvider>
        );
    })
};
