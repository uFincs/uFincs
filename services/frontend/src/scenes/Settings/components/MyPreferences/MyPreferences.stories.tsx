import type {Meta, StoryObj} from "@storybook/react";
import MyPreferences from "./MyPreferences";

const meta: Meta<typeof MyPreferences> = {
    title: "Scenes/Settings/Sections/My Preferences",
    component: MyPreferences
};

export default meta;
type Story = StoryObj<typeof MyPreferences>;

/** The default view of `MyPreferences`. */
export const Default: Story = {
    args: {}
};
