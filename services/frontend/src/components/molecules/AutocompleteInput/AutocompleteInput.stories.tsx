import {boolean} from "@storybook/addon-knobs";
import React, {useState} from "react";
import AutocompleteInput from "./AutocompleteInput";

export default {
    title: "Molecules/Autocomplete Input",
    component: AutocompleteInput
};

const filteringKnob = () => boolean("Enable Filtering", false);
const toggleKnob = () => boolean("Enable Toggle Button", false);

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

/** The default view of the `AutocompleteInput`, with a handful of suggestions. */
export const Default = () => {
    const {value, onChange} = useMakeFunctional();

    return (
        <AutocompleteInput
            containerClassName="AutocompleteInput-story"
            showToggleButton={toggleKnob()}
            enableFiltering={filteringKnob()}
            label="Search"
            value={value.label}
            suggestions={suggestions}
            onInputValueChange={onChange}
        />
    );
};

/** The `AutocompleteInput` when it has options that are too long for the width of the
 *  dropdown. These options should be clamped to 1 line with ellipses for excess text. */
export const LongOptions = () => {
    const {value, onChange} = useMakeFunctional();

    return (
        <AutocompleteInput
            containerClassName="AutocompleteInput-story"
            showToggleButton={toggleKnob()}
            enableFiltering={filteringKnob()}
            label="Search"
            value={value.label}
            suggestions={longSuggestions}
            onInputValueChange={onChange}
        />
    );
};

/** The `AutocompleteInput` when it has too many options to display at once.
 *  The dropdown should then become scrollable so that the user can select more options. */
export const ManyOptions = () => {
    const {value, onChange} = useMakeFunctional();

    return (
        <AutocompleteInput
            containerClassName="AutocompleteInput-story"
            showToggleButton={toggleKnob()}
            enableFiltering={filteringKnob()}
            label="Search"
            value={value.label}
            suggestions={manySuggestions}
            onInputValueChange={onChange}
        />
    );
};

/** The `AutocompleteInput` with filtering enabled, so that it acts like a combobox. */
export const WithFiltering = () => {
    const {value, onChange} = useMakeFunctional();

    return (
        <AutocompleteInput
            containerClassName="AutocompleteInput-story"
            showToggleButton={toggleKnob()}
            enableFiltering={true}
            label="Search"
            value={value.label}
            suggestions={suggestions}
            onInputValueChange={onChange}
        />
    );
};

/** The `AutocompleteInput` with the toggle button enabled, so that users can click
 *  to open the suggestions. */
export const WithToggleButton = () => {
    const {value, onChange} = useMakeFunctional();

    return (
        <AutocompleteInput
            containerClassName="AutocompleteInput-story"
            showToggleButton={true}
            enableFiltering={filteringKnob()}
            label="Search"
            value={value.label}
            suggestions={suggestions}
            onInputValueChange={onChange}
        />
    );
};
