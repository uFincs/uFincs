import {text} from "@storybook/addon-knobs";
import React from "react";
import StepDescription from "./StepDescription";

export default {
    title: "Molecules/Step Description",
    component: StepDescription
};

const titleKnob = () => text("Title", "Where are your transactions going?");

/** An example view of `StepDescription`, filled out with some sample content. */
export const Example = () => (
    <StepDescription title={titleKnob()}>
        <p>
            You first need to choose the <strong>account</strong> that your transactions will be{" "}
            <strong>imported to</strong>.
        </p>
    </StepDescription>
);
