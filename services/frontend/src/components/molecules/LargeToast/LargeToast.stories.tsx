import type {Meta, StoryObj} from "@storybook/react";
import LargeToast from "./LargeToast";

const meta: Meta<typeof LargeToast> = {
    title: "Molecules/Large Toast",
    component: LargeToast,
    args: {
        message: "Some other more detailed message that can span multiple lines.",
        title: "Title!",
        variant: "positive"
    }
};

export default meta;
type Story = StoryObj<typeof LargeToast>;

/** The default view of a `LargeToast`. */
export const Default: Story = {};

/** The small (mobile) view of a `LargeToast`. */
export const Small: Story = {
    args: {
        // This is a placeholder for the viewport parameter
        // In a real implementation, this would be handled by the storybook configuration
    }
};

/** What a positive `LargeToast` looks like.
 *
 *  Can be used as a confirmation for large/important operations where the user has reasonable
 *  doubt that the operation could have succeeded or failed.
 *
 *  It should _not_ be used for day-to-day operations that happen fairly frequently, like
 *  creating accounts or transactions. That is just too clutter-y.
 */
export const Positive: Story = {
    args: {
        message: "Some other more detailed message that can span multiple lines.",
        title: "Title!",
        variant: "positive"
    }
};

/** What a warning `LargeToast` looks like. */
export const Warning: Story = {
    args: {
        message: "Some other more detailed message that can span multiple lines.",
        title: "Title!",
        variant: "warning"
    }
};

/** What an negative `LargeToast` looks like. */
export const Negative: Story = {
    args: {
        message: "Some other more detailed message that can span multiple lines.",
        title: "Title!",
        variant: "negative"
    }
};

/** What a `LargeToast` looks like when only given a title.
 *
 *  This is ideal for short messages that need to be communicated to the user.
 *
 *  This is used over the `ShortToast` when the operation needs a positive/warning/negative meaning.
 */
export const NoMessage: Story = {
    args: {
        title: "Title!",
        variant: "positive"
    }
};
