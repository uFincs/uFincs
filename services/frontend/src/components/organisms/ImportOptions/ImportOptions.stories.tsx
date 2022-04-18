import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as ImportOptions} from "./ImportOptions";

export default {
    title: "Organisms/Import Options",
    component: ImportOptions
};

const optionActions = actions("onImportCSV");

/** The default view of `ImportOptions`. */
export const Default = () => <ImportOptions {...optionActions} />;
