import type {Meta, StoryObj} from "@storybook/react";
import {LabelledInput} from "components/molecules";
import CollapsibleSection from "./CollapsibleSection";

const meta: Meta<typeof CollapsibleSection> = {
    title: "Molecules/Collapsible Section",
    component: CollapsibleSection,
    args: {
        id: "CollapsibleSection--story-Default",
        className: "CollapsibleSection--story-sample",
        label: "Optional details",
        children: <LabelledInput label="Interest Rate" />
    }
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

/** An example of the `CollapsibleSection` with an input. */
export const Example: Story = {};

/** The `CollapsibleSection` open by default. */
export const Open: Story = {
    args: {
        openByDefault: true
    }
};
