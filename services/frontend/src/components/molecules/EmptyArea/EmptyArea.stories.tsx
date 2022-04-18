import {action} from "@storybook/addon-actions";
import React from "react";
import {PersonalFinance} from "assets/graphics";
import EmptyArea from "./EmptyArea";

export default {
    title: "Molecules/Empty Area",
    component: EmptyArea
};

/** An example of the `EmptyArea` used for the empty `AccountsList`. */
export const AccountsList = () => (
    <EmptyArea
        Graphic={PersonalFinance}
        title="Welp, no accounts here"
        message="Can't get much done if you don't have any accounts."
        subMessage="How about creating one now?"
        actionLabel="Add Account"
        onClick={action("click")}
    />
);
