import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {storyUsingHooks} from "utils/stories";
import AutocompleteInput from "./AutocompleteInput";

const suggestions = [
    {label: "Bought food", value: "1"},
    {label: "Bought turtles", value: "2"},
    {label: "Made money", value: "3"},
    {label: "MONEY", value: "4"}
];

const longSuggestions = [
    {label: "Bought turtles and the rest of this suggestion should be too long", value: "5"},
    {label: "Pizza is the best food in the world and there's nothing better", value: "6"},
    {label: "There's nothing better than a nice long round of gold in the morning", value: "7"}
];

const manySuggestions = [...suggestions, ...longSuggestions];

const useMakeFunctional = () => {
    const [value, setValue] = useState({label: "", value: ""});

    return {value, onChange: setValue};
};

const meta: Meta<typeof AutocompleteInput> = {
    title: "Molecules/Autocomplete Input",
    component: AutocompleteInput,
    args: {
        containerClassName: "AutocompleteInput-story",
        enableFiltering: false,
        showToggleButton: false,
        label: "Search",
        suggestions
    },
    render: storyUsingHooks((args) => {
        const {value, onChange} = useMakeFunctional();

        return <AutocompleteInput {...args} value={value.label} onInputValueChange={onChange} />;
    })
};

export default meta;
type Story = StoryObj<typeof AutocompleteInput>;

/** The default view of the `AutocompleteInput`, with a handful of suggestions. */
export const Default: Story = {};

/** The `AutocompleteInput` when it has options that are too long for the width of the
 *  dropdown. These options should be clamped to 1 line with ellipses for excess text. */
export const LongOptions: Story = {
    args: {
        suggestions: longSuggestions
    }
};

/** The `AutocompleteInput` when it has too many options to display at once.
 *  The dropdown should then become scrollable so that the user can select more options. */
export const ManyOptions: Story = {
    args: {
        suggestions: manySuggestions
    }
};

/** The `AutocompleteInput` with filtering enabled, so that it acts like a combobox. */
export const WithFiltering: Story = {
    args: {
        enableFiltering: true
    }
};

/** The `AutocompleteInput` with the toggle button enabled, so that users can click
 *  to open the suggestions. */
export const WithToggleButton: Story = {
    args: {
        showToggleButton: true
    }
};
