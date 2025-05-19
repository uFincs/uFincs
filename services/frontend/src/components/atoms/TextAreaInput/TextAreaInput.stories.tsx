import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import TextAreaInput from "./TextAreaInput";

const meta: Meta<typeof TextAreaInput> = {
    title: "Atoms/Text Area Input",
    component: TextAreaInput,
    args: {
        name: "description",
        placeholder: "Things are completely broken because..."
    }
};

export default meta;
type Story = StoryObj<typeof TextAreaInput>;

/** The default uncontrolled view of `TextAreaInput`. */
export const Uncontrolled: Story = {
    render: storyUsingHooks((args) => {
        const {register} = useForm();

        return <TextAreaInput {...args} ref={register()} />;
    })
};

/** The default controlled view of `TextAreaInput`. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [value, setValue] = useState("");

        const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(e.target.value);
        };

        return <TextAreaInput {...args} value={value} onChange={onChange} />;
    })
};

/** The labelled view of `TextAreaInput`. */
export const Labelled: Story = {
    args: {
        label: "Description"
    }
};

/** The error view of `TextAreaInput`. */
export const Error: Story = {
    args: {
        error: "Description is missing"
    }
};
