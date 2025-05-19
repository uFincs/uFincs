import type {Meta, StoryObj} from "@storybook/react";
import Checkout from "./Checkout";

const meta: Meta<typeof Checkout> = {
    title: "Scenes/Checkout",
    component: Checkout,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof Checkout>;

/** The default view of `Checkout`. */
export const Default: Story = {};
