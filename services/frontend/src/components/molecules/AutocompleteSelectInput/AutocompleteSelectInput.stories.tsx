import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import AutocompleteSelectInput from "./AutocompleteSelectInput";

const meta: Meta<typeof AutocompleteSelectInput> = {
    title: "Molecules/Autocomplete Select Input",
    component: AutocompleteSelectInput,
    args: {
        containerClassName: "AutocompleteInput-story",
        label: "Select",
        placeholder: "Select a thing",
        suggestions: [
            {label: "Bought food", value: "1"},
            {label: "Bought turtles", value: "2"},
            {label: "Made money", value: "3"},
            {label: "MONEY", value: "4"}
        ]
    }
};

export default meta;

type Story = StoryObj<typeof AutocompleteSelectInput>;

/** An example of using the `AutocompleteSelectInput` uncontrolled. */
export const Uncontrolled: Story = {
    render: storyUsingHooks((args) => {
        const {control} = useForm();

        return (
            <Controller
                name="search"
                control={control}
                defaultValue=""
                render={({value, onChange}) => (
                    <AutocompleteSelectInput
                        {...args}
                        currentValue={value}
                        onOptionSelected={onChange}
                    />
                )}
            />
        );
    })
};

/** An example of using the `AutocompleteSelectInput` controlled. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [value, setValue] = useState("");

        // Just want to wrap it to get Storybook logging.
        const onOptionSelected = (value: string) => {
            setValue(value);
        };

        return (
            <AutocompleteSelectInput
                {...args}
                currentValue={value}
                onOptionSelected={onOptionSelected}
            />
        );
    })
};
