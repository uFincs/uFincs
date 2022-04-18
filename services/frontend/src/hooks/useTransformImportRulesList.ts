import {ImportRule, ImportRuleSortOption} from "models/";
import {TableSortDirection} from "utils/types";
import useMapObjectsToIds from "./useMapObjectsToIds";
import useSortImportRules from "./useSortImportRules";

/** Sorts and paginates the list of import rules before mapping them to IDs. */
const useTransformImportRulesList = (
    rules: Array<ImportRule>,
    sortBy: ImportRuleSortOption = "date",
    sortDirection: TableSortDirection = "desc"
) => {
    const sorted = useSortImportRules(rules, sortBy, sortDirection);
    const ids = useMapObjectsToIds(sorted);

    return {ids, sortedRules: sorted};
};

export default useTransformImportRulesList;
