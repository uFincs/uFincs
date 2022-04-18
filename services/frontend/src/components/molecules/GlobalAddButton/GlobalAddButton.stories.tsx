import {actions} from "@storybook/addon-actions";
import React from "react";
import {smallViewport} from "utils/stories";
import GlobalAddButton, {PureComponent as PureGlobalAddButton} from "./GlobalAddButton";

export default {
    title: "Molecules/Global Add Button",
    component: PureGlobalAddButton
};

const buttonActions = actions("onAccount", "onImportTransactions", "onTransaction");

/** The view of the `GlobalAddButton` in the large (desktop) navigation. */
export const Large = () => (
    <PureGlobalAddButton className="GlobalAddButton--story-sample" {...buttonActions} />
);

/** The view of the `GlobalAddButton` in the small (mobile) navigation. */
export const Small = () => (
    <PureGlobalAddButton
        className="GlobalAddButton--story-sample"
        variant="small"
        {...buttonActions}
    />
);

Small.parameters = smallViewport;

/** A story for testing that the connected `GlobalAddButton` is working. */
export const Connected = () => <GlobalAddButton className="GlobalAddButton--story-sample" />;
