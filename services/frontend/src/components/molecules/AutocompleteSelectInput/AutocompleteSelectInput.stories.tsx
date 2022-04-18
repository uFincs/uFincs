import {action} from "@storybook/addon-actions";
import {text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import AutocompleteSelectInput from "./AutocompleteSelectInput";

export default {
    title: "Molecules/Autocomplete Select Input",
    component: AutocompleteSelectInput
};

const suggestions = [
    {label: "Bought food", value: "1"},
    {label: "Bought turtles", value: "2"},
    {label: "Made money", value: "3"},
    {label: "MONEY", value: "4"}
];

const labelKnob = () => text("Label", "Select");
const placeholderKnob = () => text("Placeholder", "Select a thing");

/** An example of using the `AutocompleteSelectInput` uncontrolled. */
export const Uncontrolled = () => {
    const {control} = useForm();

    return (
        <Controller
            name="search"
            control={control}
            defaultValue=""
            render={({value, onChange}) => (
                <AutocompleteSelectInput
                    containerClassName="AutocompleteInput-story"
                    label={labelKnob()}
                    placeholder={placeholderKnob()}
                    currentValue={value}
                    suggestions={suggestions}
                    onOptionSelected={onChange}
                />
            )}
        />
    );
};

/** An example of using the `AutocompleteSelectInput` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState("");

    // Just want to wrap it to get Storybook logging.
    const onOptionSelected = (value: string) => {
        setValue(value);
        action("onOptionSelected")(value);
    };

    return (
        <AutocompleteSelectInput
            containerClassName="AutocompleteInput-story"
            label={labelKnob()}
            placeholder={placeholderKnob()}
            currentValue={value}
            suggestions={suggestions}
            onOptionSelected={onOptionSelected}
        />
    );
};
