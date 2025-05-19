import type {Meta, StoryObj} from "@storybook/react";
import MapCsvStep from "./MapCsvStep";

const meta: Meta<typeof MapCsvStep> = {
    title: "Scenes/Transactions Import/Step/Map CSV",
    component: MapCsvStep
};

export default meta;
type Story = StoryObj<typeof MapCsvStep>;

/** The default view of `MapCsvStep`. */
export const Default: Story = {
    args: {},
    render: () => <MapCsvStep />
};
