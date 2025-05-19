import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import * as React from "react";
import {useForm} from "react-hook-form";
import {smallViewport, storyUsingHooks} from "utils/stories";
import LabelledInput from "./LabelledInput";

const meta: Meta<typeof LabelledInput> = {
    title: "Molecules/Labelled Input",
    component: LabelledInput,
    args: {
        label: "Email"
    }
};

export default meta;

type Story = StoryObj<typeof LabelledInput>;

/** An example of how to use the `LabelledInput` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled: Story = {
    args: {
        name: "uncontrolled",
        defaultValue: "test@test.com"
    },
    render: storyUsingHooks((args) => {
        const {register} = useForm();

        return <LabelledInput {...args} {...register()} />;
    })
};

/** An example of how to use the `LabelledInput` controlled. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [value, setValue] = useState("test@test.com");

        const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        };

        return <LabelledInput {...args} value={value} onChange={onChange} />;
    })
};

/** What the `LabelledInput` looks like on small devices. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** What the `LabelledInput` looks like with a placeholder. */
export const Placeholder: Story = {
    args: {
        placeholder: "Enter your email"
    }
};

/** What the `LabelledInput`'s error state looks like. */
export const Error: Story = {
    args: {
        placeholder: "Enter your email",
        error: "Password can't be empty"
    }
};
