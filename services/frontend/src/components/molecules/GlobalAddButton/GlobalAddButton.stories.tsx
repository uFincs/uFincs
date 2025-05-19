import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import GlobalAddButton, {PureComponent as PureGlobalAddButton} from "./GlobalAddButton";

const meta: Meta<typeof PureGlobalAddButton> = {
    title: "Molecules/Global Add Button",
    component: PureGlobalAddButton,
    args: {
        className: "GlobalAddButton--story-sample"
    }
};

export default meta;
type Story = StoryObj<typeof PureGlobalAddButton>;

/** The view of the `GlobalAddButton` in the large (desktop) navigation. */
export const Large: Story = {};

/** The view of the `GlobalAddButton` in the small (mobile) navigation. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** A story for testing that the connected `GlobalAddButton` is working. */
export const Connected: Story = {
    render: (args) => <GlobalAddButton {...args} />
};
