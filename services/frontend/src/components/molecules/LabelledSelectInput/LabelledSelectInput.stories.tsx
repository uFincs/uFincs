import {boolean, text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {mappableFieldOptions} from "values/importProfileFields";
import LabelledSelectInput from "./LabelledSelectInput";

export default {
    title: "Molecules/Labelled Select Input",
    component: LabelledSelectInput
};

const labelKnob = () => text("Label", "Field");

/** An example of how to use the `LabelledSelectInput` uncontrolled. */
export const Uncontrolled = () => {
    const {control} = useForm();

    return (
        <Controller
            name="controlled"
            control={control}
            defaultValue=""
            render={({value, onChange}) => (
                <LabelledSelectInput
                    name="uncontrolled"
                    label={labelKnob()}
                    defaultValue={mappableFieldOptions[0].value}
                    value={value}
                    values={mappableFieldOptions}
                    onChange={onChange}
                />
            )}
        />
    );
};

/** An example of how to use the `LabelledSelectInput` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState(mappableFieldOptions[0].value as string);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return (
        <LabelledSelectInput
            label={labelKnob()}
            value={value}
            values={mappableFieldOptions}
            onChange={onChange}
        />
    );
};

/** What the `LabelledSelectInput`'s error state looks like. */
export const Error = () => {
    const [value, setValue] = useState(mappableFieldOptions[0].value as string);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return (
        <LabelledSelectInput
            label={labelKnob()}
            value={value}
            values={mappableFieldOptions}
            onChange={onChange}
            hasStatusState={true}
            error={boolean("Error", true) ? text("Error Message", "You dun goofed") : ""}
        />
    );
};
