import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as EmptyTransactionsArea} from "./EmptyTransactionsArea";

export default {
    title: "Molecules/Empty Transactions Area",
    component: EmptyTransactionsArea
};

const areaActions = actions("onAddTransaction");

/** The default view of the `EmptyTransactionsArea`. */
export const Default = () => <EmptyTransactionsArea {...areaActions} />;
