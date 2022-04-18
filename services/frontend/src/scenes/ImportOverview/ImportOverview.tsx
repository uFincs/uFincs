import classNames from "classnames";
import React from "react";
import {Button, OverlineHeading} from "components/atoms";
import {CombinedImportRulesView, ImportOptions} from "components/organisms";
import connect, {ConnectedProps} from "./connect";
import "./ImportOverview.scss";

interface ImportOverviewProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The Import Overview scene. Shows the user options for importing, along with their import rules. */
const ImportOverview = ({className, importRules = [], onAddRule}: ImportOverviewProps) => (
    <div className={classNames("ImportOverview", className)}>
        <OverlineHeading>Import Transactions</OverlineHeading>

        <div className="ImportOverview-options">
            <h2>Import From...</h2>

            <ImportOptions />
        </div>

        <div className="ImportOverview-rules">
            <div className="ImportOverview-rules-header">
                <h2>Import Rules</h2>
                <Button onClick={onAddRule}>Add Rule</Button>
            </div>

            <CombinedImportRulesView importRules={importRules} />
        </div>
    </div>
);

export const PureComponent = ImportOverview;
export default connect(ImportOverview);
