import type {Meta, StoryObj} from "@storybook/react";
import StepDescription from "./StepDescription";

const meta: Meta<typeof StepDescription> = {
    title: "Molecules/Step Description",
    component: StepDescription,
    args: {
        title: "Where are your transactions going?"
    }
};

export default meta;
type Story = StoryObj<typeof StepDescription>;

/** An example view of `StepDescription`, filled out with some sample content. */
export const Example: Story = {
    args: {
        // title is already defined in meta args
    }
};
