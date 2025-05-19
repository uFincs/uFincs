import type {Meta, StoryObj} from "@storybook/react";
import AmountChange from "./AmountChange";

const meta: Meta<typeof AmountChange> = {
    title: "Atoms/Amount Change",
    component: AmountChange,
    args: {
        oldAmount: 140000,
        newAmount: 150000,
        lightShade: false,
        positiveIsBad: false,
        showDifference: false
    }
};

export default meta;
type Story = StoryObj<typeof AmountChange>;

/** The default view of `AmountChange`. */
export const Default: Story = {};

/** `AmountChange` using light shades of colors; for use on a dark background.. */
export const LightShade: Story = {
    args: {
        lightShade: true
    }
};

/** `AmountChange` for values where positive changes are bad and negative are good. */
export const PositiveIsBad: Story = {
    args: {
        positiveIsBad: true
    }
};

/** `AmountChange` with showing the difference between the two amounts. */
export const ShowDifference: Story = {
    args: {
        showDifference: true
    }
};
