import {createSelector} from "@reduxjs/toolkit";
import {ImportRule} from "models/";
import {importRulesSlice, importRuleActionsSlice, importRuleConditionsSlice} from "store/slices";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";

const selectImportRule = (id: Id) =>
    createSelector(
        [
            importRulesSlice.selectors.selectImportRules,
            importRuleActionsSlice.selectors.selectImportRuleActions,
            importRuleConditionsSlice.selectors.selectImportRuleConditions
        ],
        (rulesById, actionsById, conditionsById) =>
            ImportRule.populateImportRule(actionsById, conditionsById)(rulesById[id])
    );

const selectImportRulesById = createSelector(
    [
        importRulesSlice.selectors.selectImportRules,
        importRuleActionsSlice.selectors.selectImportRuleActions,
        importRuleConditionsSlice.selectors.selectImportRuleConditions
    ],
    (rulesById, actionsById, conditionsById) =>
        objectReduce(rulesById, (rule) =>
            ImportRule.populateImportRule(actionsById, conditionsById)(rule)
        )
);

const selectImportRules = createSelector([selectImportRulesById], (rulesById) =>
    Object.values(rulesById)
);

const importRuleSelectors = {
    selectImportRule,
    selectImportRulesById,
    selectImportRules
};

export default importRuleSelectors;
