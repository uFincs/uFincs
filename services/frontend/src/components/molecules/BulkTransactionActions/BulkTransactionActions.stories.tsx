import {actions} from "@storybook/addon-actions";
import React from "react";
import {SelectableListProvider} from "hooks/";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";
import BulkTransactionActions from "./BulkTransactionActions";

export default {
    title: "Molecules/Bulk Transaction Actions",
    component: BulkTransactionActions
};

const transactionsById = {a: new Transaction({id: "a"})};

// Yes, the name is facetious.
const actionActions = actions("onSubmit");

/** The default view of `BulkTransactionActions`. */
export const Default = () => (
    <SelectableListProvider>
        <BulkTransactionActions transactionsById={transactionsById} {...actionActions} />
    </SelectableListProvider>
);

/** The small view of `BulkTransactionActions`. */
export const Small = () => (
    <SelectableListProvider>
        <div className="BulkTransactionActions--story-Small">
            <BulkTransactionActions transactionsById={transactionsById} {...actionActions} />
        </div>
    </SelectableListProvider>
);

Small.parameters = smallViewport;
