import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
    title: "Atoms/Checkbox",
    component: Checkbox,
    args: {
        label: "Select all",
        partiallyChecked: false
    }
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** An example how to use the `Checkbox` uncontrolled. */
export const Uncontrolled: Story = {
    render: storyUsingHooks((args) => {
        const {register} = useForm();

        return <Checkbox {...args} {...register()} />;
    })
};

/** An example of how to use the `Checkbox` controlled. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [checked, setChecked] = useState(false);

        return (
            <Checkbox
                {...args}
                checked={checked}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked)}
            />
        );
    })
};

/** The `Checkbox`, but without a label. */
export const NoLabel: Story = {
    args: {
        label: ""
    }
};

/** The `Checkbox`, but with an error. */
export const Error: Story = {
    args: {
        label: "",
        error: "This is an error"
    }
};
