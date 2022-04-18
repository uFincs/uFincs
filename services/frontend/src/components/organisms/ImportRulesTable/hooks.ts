import {useTableSorting, useTransformImportRulesList} from "hooks/";
import {ImportRule, ImportRuleSortOption} from "models/";

/** The hook with all of the primary logic of the `ImportRulesTable`. */
export const useImportRulesTable = (importRules: Array<ImportRule>) => {
    const {sortState, onSortChange} = useTableSorting<ImportRuleSortOption>("date");

    const {ids} = useTransformImportRulesList(importRules, sortState.by, sortState.direction);

    return {ids, sortState, onSortChange};
};
