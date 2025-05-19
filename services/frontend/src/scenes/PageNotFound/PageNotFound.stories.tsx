import type {Meta, StoryObj} from "@storybook/react";
import PageNotFound from "./PageNotFound";

const meta: Meta<typeof PageNotFound> = {
    title: "Scenes/Page Not Found",
    component: PageNotFound
};

export default meta;
type Story = StoryObj<typeof PageNotFound>;

/** The default view of `PageNotFound`. */
export const Default: Story = {};
