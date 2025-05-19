import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as EmptyTransactionsArea} from "./EmptyTransactionsArea";

const meta: Meta<typeof EmptyTransactionsArea> = {
    title: "Molecules/Empty Transactions Area",
    component: EmptyTransactionsArea
};

export default meta;
type Story = StoryObj<typeof EmptyTransactionsArea>;

const areaActions = actions("onAddTransaction");

/** The default view of the `EmptyTransactionsArea`. */
export const Default: Story = {
    args: {
        ...areaActions
    }
};
