import React from "react";
import WarningMessage from "./WarningMessage";

export default {
    title: "Molecules/Warning Message",
    component: WarningMessage
};

/** The default view of `WarningMessage`. */
export const Default = () => (
    <WarningMessage>
        <strong>Looks like we found 3 duplicate transactions.</strong>
        <br /> <br />
        They have been <strong>automatically excluded</strong> from being imported.
        <br /> <br />
        If you want to <strong>include</strong> any of them, just select the transactions and choose
        the <strong>&quot;Include in Import&quot;</strong> action.
    </WarningMessage>
);
