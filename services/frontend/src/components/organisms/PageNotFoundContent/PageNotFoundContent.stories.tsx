import type {Meta, StoryObj} from "@storybook/react";
import PageNotFoundContent from "./PageNotFoundContent";

const meta: Meta<typeof PageNotFoundContent> = {
    title: "Organisms/Page Not Found Content",
    component: PageNotFoundContent,
    args: {
        linkToPlaceThatDoesExist: "/",
        placeThatDoesExist: "homepage"
    }
};

export default meta;
type Story = StoryObj<typeof PageNotFoundContent>;

/** The default view of `PageNotFoundContent`. */
export const Default: Story = {};
