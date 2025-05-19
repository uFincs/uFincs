import {Meta, StoryObj} from "@storybook/react";
import {StepNavigationButtons} from "components/molecules";
import ProgressStepper from "./ProgressStepper";

const meta: Meta<typeof ProgressStepper> = {
    title: "Organisms/Progress Stepper",
    component: ProgressStepper,
    args: {
        currentStep: 0,
        steps: [
            "Choose Account",
            "Choose CSV File",
            "Match CSV Columns",
            "Adjust Transactions",
            "Finish Import"
        ],
        StepNavigationButtons: StepNavigationButtons
    }
};

export default meta;
type Story = StoryObj<typeof ProgressStepper>;

/** The default view of `ProgressStepper`. */
export const Default: Story = {};
