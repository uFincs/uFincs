import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import FinishSetupStep from "./FinishSetupStep";

const meta: Meta<typeof FinishSetupStep> = {
    title: "Scenes/Onboarding/Step/Finish Setup",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: FinishSetupStep
};

export default meta;
type Story = StoryObj<typeof FinishSetupStep>;

/** The default view of `FinishSetupStep`. */
export const Default: Story = {
    args: {}
};
