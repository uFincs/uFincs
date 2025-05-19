import type {Meta, StoryObj} from "@storybook/react";
import {SelectableListProvider} from "hooks/";
import SelectableListCheckbox from "./SelectableListCheckbox";

const meta: Meta<typeof SelectableListCheckbox> = {
    title: "Molecules/Selectable List Checkbox",
    decorators: [
        (Story) => (
            <SelectableListProvider>
                <Story />
            </SelectableListProvider>
        )
    ],
    component: SelectableListCheckbox,
    args: {
        items: [{id: "1"}, {id: "2"}, {id: "3"}]
    }
};

export default meta;
type Story = StoryObj<typeof SelectableListCheckbox>;

/** The default view of `SelectableListCheckbox`. */
export const Default: Story = {};
