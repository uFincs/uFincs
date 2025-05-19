import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as SplashScreen} from "./SplashScreen";

const meta: Meta<typeof SplashScreen> = {
    title: "Molecules/Splash Screen",
    component: SplashScreen,
    args: {
        isOpen: false
    }
};

export default meta;
type Story = StoryObj<typeof SplashScreen>;

/** The default view of `SplashScreen`. */
export const Default: Story = {
    args: {
        isOpen: true
    }
};
