import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import StepNavigationFooter from "./StepNavigationFooter";

const meta: Meta<typeof StepNavigationFooter> = {
    title: "Organisms/Step Navigation Footer",
    component: StepNavigationFooter
};

export default meta;
type Story = StoryObj<typeof StepNavigationFooter>;

const footerActions = actions("onNextStep", "onPreviousStep");

/** The default view of `StepNavigationFooter`. */
export const Default: Story = {
    args: {
        ...footerActions
    }
};
