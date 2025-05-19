import type {Meta, StoryObj} from "@storybook/react";
import OverlineHeading from "./OverlineHeading";

const meta: Meta<typeof OverlineHeading> = {
    title: "Atoms/Overline Heading",
    component: OverlineHeading,
    args: {
        children: "Login",
        size: "normal"
    }
};

export default meta;
type Story = StoryObj<typeof OverlineHeading>;

/** The normal size of an `OverlineHeading`. */
export const Normal: Story = {};

/** The large size of an `OverlineHeading`. */
export const Large: Story = {
    args: {
        size: "large"
    }
};

/** The small size of an `OverlineHeading`. */
export const Small: Story = {
    args: {
        size: "small"
    }
};
