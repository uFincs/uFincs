import React, {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {TransactionsSearchProvider} from "hooks/";
import {storyData, storyUsingRedux, useCreateTransactions} from "utils/stories";
import TransactionsAutocompleteInput from "./TransactionsAutocompleteInput";

export default {
    title: "Molecules/Transactions Autocomplete Input",
    component: TransactionsAutocompleteInput
};

const {transactions} = storyData;

/** An example of how to use the `TransactionsAutocompleteInput` controlled
 *  (e.g. with react-hook-form). */
export const Uncontrolled = storyUsingRedux(() => {
    useCreateTransactions(transactions);

    const {control} = useForm();

    return (
        <TransactionsSearchProvider>
            <Controller
                control={control}
                defaultValue=""
                name="description"
                render={({value, onChange}) => (
                    <TransactionsAutocompleteInput
                        label="Description"
                        placeholder="e.g. Bought some food"
                        value={value.label}
                        onInputValueChange={onChange}
                    />
                )}
            />
        </TransactionsSearchProvider>
    );
});

/** An example of how to use the `TransactionsAutocompleteInput` controlled. */
export const Controlled = storyUsingRedux(() => {
    useCreateTransactions(transactions);

    const [value, setValue] = useState("");

    return (
        <TransactionsSearchProvider>
            <TransactionsAutocompleteInput
                label="Description"
                placeholder="e.g. Bought some food"
                value={value}
                onInputValueChange={setValue}
            />
        </TransactionsSearchProvider>
    );
});
