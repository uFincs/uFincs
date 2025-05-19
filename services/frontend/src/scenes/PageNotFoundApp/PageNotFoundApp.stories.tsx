import type {Meta, StoryObj} from "@storybook/react";
import PageNotFoundApp from "./PageNotFoundApp";

const meta: Meta<typeof PageNotFoundApp> = {
    title: "Scenes/Page Not Found App",
    component: PageNotFoundApp
};

export default meta;
type Story = StoryObj<typeof PageNotFoundApp>;

/** The default view of `PageNotFoundApp`. */
export const Default: Story = {
    args: {},
    render: () => <PageNotFoundApp />
};
