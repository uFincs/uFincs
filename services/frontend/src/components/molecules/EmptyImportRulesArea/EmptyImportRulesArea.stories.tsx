import {actions} from "@storybook/addon-actions";
import React from "react";
import EmptyImportRulesArea from "./EmptyImportRulesArea";

export default {
    title: "Molecules/Empty Import Rules Area",
    component: EmptyImportRulesArea
};

const areaActions = actions("onAddRule");

/** The default view of the `EmptyImportRulesArea`. */
export const Default = () => <EmptyImportRulesArea {...areaActions} />;
