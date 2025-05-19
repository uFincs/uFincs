import type {Meta, StoryObj} from "@storybook/react";
import SmallToast from "./SmallToast";

const meta: Meta<typeof SmallToast> = {
    title: "Molecules/Small Toast",
    component: SmallToast,
    args: {
        message: "Transaction deleted"
    }
};

export default meta;
type Story = StoryObj<typeof SmallToast>;

/** The default view of a `SmallToast`. */
export const Default: Story = {
    args: {
        actionLabel: undefined
    }
};

/** The small (mobile) view of a `SmallToast`. */
export const Small: Story = {
    args: {
        message: "Transaction deleted"
    },
    parameters: {
        viewport: {
            default: "mobile"
        }
    }
};

/** A `SmallToast` with an (undo) action. */
export const WithAction: Story = {
    args: {
        actionLabel: "Undo"
    }
};
