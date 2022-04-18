import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {ValueFormatting} from "services/";
import ListItem from "./ListItem";

export default {
    title: "Molecules/List Item",
    component: ListItem
};

const clickActions = actions({onClick: "click", onDelete: "delete", onEdit: "edit"});

/** The double layer (mobile) view of a `ListItem`. */
export const DoubleLayer = () => (
    <ListItem singleLayer={false} {...clickActions}>
        {text("Text", "Chequing")}
    </ListItem>
);

/** The single layer (desktop) view of a `ListItem`. */
export const SingleLayer = () => (
    <ListItem singleLayer={true} active={boolean("Active", true)} {...clickActions}>
        <div className="ListItem--story-SingleLayer">
            <p>{text("Name", "Chequing")}</p>
            <p>{text("Balance", ValueFormatting.formatMoney(500000))}</p>
        </div>
    </ListItem>
);

/** The double layer `ListItem` but without any actions enabled. */
export const DoubleLayerNoActions = () => (
    <ListItem singleLayer={false} actionsToShow={[]} {...clickActions}>
        {text("Text", "Chequing")}
    </ListItem>
);

/** The empty view of a `ListItem`. */
export const Empty = () => (
    <ListItem singleLayer={boolean("Single Layer", false)} {...clickActions} />
);

/** An example of how really long text could be handled in the `ListItem`.
 *  Here it is clamped to two lines with an ellipsis at the end.
 */
export const ReallyLongText = () => (
    <ListItem singleLayer={false} {...clickActions}>
        <div className="ListItem--story-SingleLayer">
            <p>Chequing Account that has a really long name that will get cut off</p>
            <p>{ValueFormatting.formatMoney(500000)}</p>
        </div>
    </ListItem>
);
