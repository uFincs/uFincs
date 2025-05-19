import {action} from "@storybook/addon-actions";
import {type Meta, type StoryObj} from "@storybook/react";
import {PersonalFinance} from "assets/graphics";
import EmptyArea from "./EmptyArea";

const meta: Meta<typeof EmptyArea> = {
    title: "Molecules/Empty Area",
    component: EmptyArea
};

export default meta;
type Story = StoryObj<typeof EmptyArea>;

/** An example of the `EmptyArea` used for the empty `AccountsList`. */
export const AccountsList: Story = {
    args: {
        Graphic: PersonalFinance,
        title: "Welp, no accounts here",
        message: "Can't get much done if you don't have any accounts.",
        subMessage: "How about creating one now?",
        actionLabel: "Add Account",
        onClick: action("click")
    }
};
