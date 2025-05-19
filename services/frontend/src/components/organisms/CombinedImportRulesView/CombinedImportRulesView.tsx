import {memo} from "react";
import {ImportRulesList, ImportRulesTable} from "components/organisms";
import {useWindowWidthBreakpoint} from "hooks/";
import {ImportRulesViewProps} from "utils/componentTypes";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import "./CombinedImportRulesView.scss";

interface CombinedImportRulesViewProps extends ImportRulesViewProps {}

/** The combination of the `ImportRulesList` (mobile) and `ImportRulesTable` (desktop) to
 *  create a single responsive view for displaying import rules. */
const CombinedImportRulesView = memo((props: CombinedImportRulesViewProps) => {
    const showTable = useWindowWidthBreakpoint(navigationBreakpointMatches);

    return (
        <>
            {showTable && (
                <ImportRulesTable
                    className="ImportRules-desktop-table"
                    data-testid="import-rules-table-desktop"
                    {...props}
                />
            )}

            {!showTable && (
                <ImportRulesList
                    className="ImportRules-mobile-list"
                    data-testid="import-rules-list-mobile"
                    {...props}
                />
            )}
        </>
    );
});

export default CombinedImportRulesView;
