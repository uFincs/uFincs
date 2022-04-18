import {boolean, text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import Checkbox from "./Checkbox";

export default {
    title: "Atoms/Checkbox",
    component: Checkbox
};

const partiallyCheckedKnob = () => boolean("Partially Selected", false);
const labelKnob = () => text("Label", "Select all");

/** An example how to use the `Checkbox` uncontrolled. */
export const Uncontrolled = () => {
    const {register} = useForm();

    return (
        <Checkbox
            name="uncontrolled"
            label={labelKnob()}
            partiallyChecked={partiallyCheckedKnob()}
            ref={register()}
        />
    );
};

/** An example of how to use the `Checkbox` controlled. */
export const Controlled = () => {
    const [checked, setChecked] = useState(false);

    return (
        <Checkbox
            checked={checked}
            label={labelKnob()}
            partiallyChecked={partiallyCheckedKnob()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked)}
        />
    );
};

/** The `Checkbox`, but without a label. */
export const NoLabel = () => <Checkbox label="" partiallyChecked={partiallyCheckedKnob()} />;

/** The `Checkbox`, but with an error. */
export const Error = () => (
    <Checkbox label="" error="This is an error" partiallyChecked={partiallyCheckedKnob()} />
);
