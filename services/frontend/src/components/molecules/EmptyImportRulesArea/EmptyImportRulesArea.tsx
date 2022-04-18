import classNames from "classnames";
import React from "react";
import {Rules} from "assets/graphics";
import {EmptyArea} from "components/molecules";
import "./EmptyImportRulesArea.scss";

interface EmptyImportRulesAreaProps {
    /** Custom class name. */
    className?: string;

    /** Handler for clicking on the Add Rule button. */
    onAddRule: (e: React.MouseEvent) => void;
}

/** The import rules specific binding of an `EmptyArea`.
 *  Useful for import rule lists and tables to let users know they don't got nothing. */
const EmptyImportRulesArea = ({className, onAddRule}: EmptyImportRulesAreaProps) => (
    <EmptyArea
        className={classNames("EmptyImportRulesArea", className)}
        data-testid="import-rules-list-empty"
        Graphic={Rules}
        title="Welp, no import rules here"
        message="Doesn't look like you've made any import rules yet."
        subMessage="How about creating one now?"
        actionLabel="Add Rule"
        onClick={onAddRule}
    />
);

export default EmptyImportRulesArea;
