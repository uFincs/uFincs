import {boolean, text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {smallViewport} from "utils/stories";
import LabelledInput from "./LabelledInput";

export default {
    title: "Molecules/Labelled Input",
    component: LabelledInput
};

/** An example of how to use the `LabelledInput` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled = () => {
    const {register} = useForm();

    return (
        <LabelledInput
            label="Email"
            name="uncontrolled"
            defaultValue={"test@test.com"}
            ref={register()}
        />
    );
};

/** An example of how to use the `LabelledInput` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState("test@test.com");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    return <LabelledInput label={text("Label", "Email")} value={value} onChange={onChange} />;
};

/** What the `LabelledInput` looks like on small devices. */
export const Small = () => <LabelledInput label="Email" />;

Small.parameters = smallViewport;

/** What the `LabelledInput` looks like with a placeholder. */
export const Placeholder = () => (
    <LabelledInput
        label={text("Label", "Email")}
        placeholder={text("Placeholder", "Enter your email")}
    />
);

/** What the `LabelledInput`'s error state looks like. */
export const Error = () => (
    <LabelledInput
        label={text("Label", "Password")}
        placeholder={text("Placeholder", "Enter your password")}
        error={boolean("Error", true) ? text("Error Message", "Password can't be empty") : ""}
    />
);
