import {actions} from "@storybook/addon-actions";
import React from "react";
import TransactionsImportEditForm from "./TransactionsImportEditForm";

export default {
    title: "Organisms/Transactions Import Edit Form",
    component: TransactionsImportEditForm
};

const formActions = actions("onClose");

/** The default view of `TransactionsImportEditForm`. */
export const Default = () => <TransactionsImportEditForm {...formActions} />;
