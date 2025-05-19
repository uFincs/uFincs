import type {Meta, StoryObj} from "@storybook/react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import SelectInput from "./SelectInput";

const meta: Meta<typeof SelectInput> = {
    title: "Atoms/Select Input",
    component: SelectInput,
    args: {
        values: [
            {label: "Daily", value: "daily"},
            {label: "Weekly", value: "weekly"},
            {label: "Monthly", value: "monthly"},
            {label: "Yearly", value: "yearly"},
            {label: "All Time", value: "allTime"},
            {label: "Custom", value: "custom"}
        ],
        title: "Date Range",
        defaultValue: "daily"
    }
};

export default meta;
type Story = StoryObj<typeof SelectInput>;

/** An example of how to use the `SelectInput` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled: Story = {
    render: storyUsingHooks((args) => {
        const {register} = useForm();

        return <SelectInput {...args} name="uncontrolled" ref={register()} />;
    })
};

/** An example of how to use the `SelectInput` controlled. */
export const Controlled: Story = {
    render: storyUsingHooks((args) => {
        const [value, setValue] = useState(args.value || "daily");
        const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

        return <SelectInput {...args} value={value} onChange={onChange} />;
    })
};

/** An example of the `SelectInput` with a placeholder and empty first option. */
export const Placeholder: Story = {
    args: {
        placeholder: "Select a thing"
    },
    render: storyUsingHooks((args) => {
        const [value, setValue] = useState(args.values[0].value);
        const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

        return <SelectInput {...args} value={value} onChange={onChange} />;
    })
};

/** What the `SelectInput`'s error state looks like. */
export const Error: Story = {
    args: {
        error: true
    }
};

/** What the `SelectInput`'s success state looks like. */
export const Success: Story = {
    args: {
        hasStatusState: true,
        showSuccess: true
    }
};

/** What the `SelectInput` looks like when it's disabled. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** A `SelectInput` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        containerClassName: "Element--story-FocusOutline"
    }
};
