import {useMemo} from "react";
import {ImportRule, ImportRuleSortOption} from "models/";
import {TableSortDirection} from "utils/types";

/** A small wrapper hook for sorting a list of import rules any which way. */
const useSortImportRules = (
    rules: Array<ImportRule>,
    sortBy: ImportRuleSortOption = "date",
    sortDirection: TableSortDirection = "desc"
) => useMemo(() => ImportRule.sort(rules, sortBy, sortDirection), [rules, sortBy, sortDirection]);

export default useSortImportRules;
