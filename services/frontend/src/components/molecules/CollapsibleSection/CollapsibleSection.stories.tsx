import {text} from "@storybook/addon-knobs";
import React from "react";
import {LabelledInput} from "components/molecules";
import CollapsibleSection from "./CollapsibleSection";

export default {
    title: "Molecules/Collapsible Section",
    component: CollapsibleSection
};

/** An example of the `CollapsibleSection` with an input. */
export const Example = () => (
    <CollapsibleSection
        id="CollapsibleSection--story-Default"
        className="CollapsibleSection--story-sample"
        label={text("Label", "Optional details")}
    >
        <LabelledInput label="Interest Rate" />
    </CollapsibleSection>
);

/** The `CollapsibleSection` open by default. */
export const Open = () => (
    <CollapsibleSection
        id="CollapsibleSection--story-Default"
        className="CollapsibleSection--story-sample"
        label={text("Label", "Optional details")}
        openByDefault={true}
    >
        <LabelledInput label="Interest Rate" />
    </CollapsibleSection>
);
