import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {ChevronDownIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import Input from "./Input";

const meta: Meta<typeof Input> = {
    title: "Atoms/Input",
    component: Input,
    args: {
        placeholder: "Enter your email",
        defaultValue: "test@test.com",
        disabled: false,
        error: false,
        hasSuccessState: false,
        showSuccess: false,
        prefix: undefined,
        RightIcon: undefined,
        rightIconButtonProps: {onClick: action("right icon click")}
    }
};

export default meta;
type Story = StoryObj<typeof Input>;

/** An example of how to use the `Input` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled: Story = {
    args: {
        name: "uncontrolled",
        defaultValue: "test@test.com",
        ref: undefined
    }
};

/** An example of how to use the `Input` controlled. */
export const Controlled: Story = {
    args: {
        value: "test@test.com",
        onChange: (_e: React.ChangeEvent<HTMLInputElement>) => {
            // This is just a placeholder function
            // In a real app, you would handle the change here
        }
    }
};

/** What the `Input` looks like on small devices. */
export const Small: Story = {
    args: {
        placeholder: "Enter your email"
    },
    parameters: {
        ...smallViewport
    }
};

/** What the `Input` looks like with a placeholder. */
export const Placeholder: Story = {
    args: {
        name: "placeholder",
        placeholder: "Enter your email"
    }
};

/** What the `Input` looks like with the dollar prefix. */
export const DollarPrefix: Story = {
    args: {
        name: "placeholder",
        placeholder: "3.50",
        prefix: "$"
    }
};

/** What the `Input` looks like with the percentage prefix. */
export const PercentPrefix: Story = {
    args: {
        name: "placeholder",
        placeholder: "3.50",
        prefix: "%"
    }
};

/** What the `Input` looks like with the success indicator. */
export const Success: Story = {
    args: {
        placeholder: "Pick a currency",
        hasSuccessState: true,
        showSuccess: true
    }
};

/** The `Input` with an optional right icon. */
export const RightIcon: Story = {
    args: {
        placeholder: "Pick an account",
        RightIcon: ChevronDownIcon
    }
};

/** The `Input` with an optional right icon _button_. */
export const RightIconButton: Story = {
    args: {
        placeholder: "Pick an account",
        RightIcon: ChevronDownIcon
    }
};

/** The `Input` with an optional right icon _and_ error. */
export const RightIconWithError: Story = {
    args: {
        placeholder: "Pick an account",
        RightIcon: ChevronDownIcon,
        error: true
    }
};

/** The `Input` with the success indicator and a right icon. */
export const RightIconWithSuccess: Story = {
    args: {
        placeholder: "Pick a currency",
        RightIcon: ChevronDownIcon,
        hasSuccessState: true,
        showSuccess: true
    }
};

/** The `Input` with the success indicator, the error icon, and a right icon for testing. */
export const RightIconWithSuccessAndError: Story = {
    args: {
        placeholder: "Pick a currency",
        RightIcon: ChevronDownIcon,
        error: false,
        hasSuccessState: true,
        showSuccess: false
    }
};

/** What the `Input` looks like when it's disabled. */
export const Disabled: Story = {
    args: {
        defaultValue: "test@test.com",
        disabled: true
    }
};

/** An `Input` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        defaultValue: "test@test.com",
        containerClassName: "Element--story-FocusOutline"
    }
};
