import {text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import RadioGroup from "./RadioGroup";

export default {
    title: "Molecules/Radio Group",
    component: RadioGroup
};

const options = [
    {label: "option 1", value: "option1"},
    {label: "option 2", value: "option2"},
    {label: "option 3", value: "option3"}
];

/** The view of the `RadioGroup` using the default option components. */
export const DefaultOptions = () => {
    const [value, setValue] = useState("option1");

    return (
        <RadioGroup
            id="Story-Default"
            label={text("Label", "Some Options")}
            options={options}
            value={value}
            onChange={setValue}
        />
    );
};

/** The disabled view of the `RadioGroup`; none of the options should be clickable. */
export const Disabled = () => {
    const [value, setValue] = useState("option1");

    return (
        <RadioGroup
            id="Story-Default"
            disabled={true}
            label={text("Label", "Some Options")}
            options={options}
            value={value}
            onChange={setValue}
        />
    );
};
