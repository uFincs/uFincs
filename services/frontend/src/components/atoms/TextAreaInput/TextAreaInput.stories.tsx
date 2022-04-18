import React, {useState} from "react";
import {useForm} from "react-hook-form";
import TextAreaInput from "./TextAreaInput";

export default {
    title: "Atoms/Text Area Input",
    component: TextAreaInput
};

/** The default uncontrolled view of `TextAreaInput`. */
export const Uncontrolled = () => {
    const {register} = useForm();

    return (
        <TextAreaInput
            name="description"
            placeholder="Things are completely broken because..."
            ref={register()}
        />
    );
};

/** The default controlled view of `TextAreaInput`. */
export const Controlled = () => {
    const [value, setValue] = useState("");

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    return (
        <TextAreaInput
            name="description"
            placeholder="Things are completely broken because..."
            value={value}
            onChange={onChange}
        />
    );
};

/** The labelled view of `TextAreaInput`. */
export const Labelled = () => (
    <TextAreaInput label="Description" placeholder="Things are completely broken because..." />
);

/** The error view of `TextAreaInput`. */
export const Error = () => (
    <TextAreaInput
        error="Description is missing"
        placeholder="Things are completely broken because..."
    />
);
