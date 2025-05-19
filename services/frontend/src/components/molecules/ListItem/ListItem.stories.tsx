import {Meta, StoryObj} from "@storybook/react";
import {ValueFormatting} from "services/";
import ListItem from "./ListItem";

const meta: Meta<typeof ListItem> = {
    title: "Molecules/List Item",
    component: ListItem,
    args: {
        children: "Chequing",
        singleLayer: false,
        active: true
    }
};

export default meta;
type Story = StoryObj<typeof ListItem>;

/** The double layer (mobile) view of a `ListItem`. */
export const DoubleLayer: Story = {};

/** The single layer (desktop) view of a `ListItem`. */
export const SingleLayer: Story = {
    args: {
        children: (
            <div className="ListItem--story-SingleLayer">
                <p>Chequing</p>
                <p>{ValueFormatting.formatMoney(500000)}</p>
            </div>
        ),
        singleLayer: true
    }
};

/** The double layer `ListItem` but without any actions enabled. */
export const DoubleLayerNoActions: Story = {
    args: {
        actionsToShow: []
    }
};

/** The empty view of a `ListItem`. */
export const Empty: Story = {
    args: {
        children: undefined
    }
};

/** An example of how really long text could be handled in the `ListItem`.
 *  Here it is clamped to two lines with an ellipsis at the end.
 */
export const ReallyLongText: Story = {
    args: {
        children: (
            <div className="ListItem--story-SingleLayer">
                <p>Chequing Account that has a really long name that will get cut off</p>
                <p>{ValueFormatting.formatMoney(500000)}</p>
            </div>
        )
    }
};
