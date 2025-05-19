import type {Meta, StoryObj} from "@storybook/react";
import MyData from "./MyData";

const meta: Meta<typeof MyData> = {
    title: "Scenes/Settings/Sections/My Data",
    component: MyData
};

export default meta;
type Story = StoryObj<typeof MyData>;

/** The default view of `MyData`. */
export const Default: Story = {
    args: {}
};
