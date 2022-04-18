import classNames from "classnames";
import React from "react";
import {Checkbox, ShadowButton} from "components/atoms";
import {CollapsibleSection} from "components/molecules";
import {CombinedImportRulesView} from "components/organisms";
import {ImportRulesViewProps} from "utils/componentTypes";
import connect, {ConnectedProps} from "./connect";
import "./ActiveImportRules.scss";

interface ActiveImportRulesProps extends ImportRulesViewProps, ConnectedProps {}

/** A collapsible section that displays the list of active import rules during the Adjust Transactions
 *  step of the import process. */
const ActiveImportRules = ({
    className,
    areRulesEnabled = true,
    importRules = [],
    onAddRule,
    onToggleRules
}: ActiveImportRulesProps) => (
    <CollapsibleSection
        className={classNames("ActiveImportRules", className)}
        id="ActiveImportRules-collapsible-section"
        label="Active Import Rules"
    >
        <div className="ActiveImportRules-content">
            <div className="ActiveImportRules-header">
                <Checkbox
                    label="Enable Rules"
                    checked={areRulesEnabled}
                    onChange={(e) => onToggleRules(e.target.checked)}
                />

                <ShadowButton onClick={onAddRule}>Add Rule</ShadowButton>
            </div>

            <CombinedImportRulesView actionsToShow={["edit"]} importRules={importRules} />
        </div>
    </CollapsibleSection>
);

export const PureComponent = ActiveImportRules;
export default connect(ActiveImportRules);
