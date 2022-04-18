import ImportRule from "./ImportRule";
import ImportRuleCondition from "./ImportRuleCondition";

describe("calculateRank", () => {
    it("should return 0 for a rule without conditions", () => {
        const rule = new ImportRule();
        expect(ImportRule.calculateRank(rule)).toBe(0);
    });

    it("should return 1 for a rule with one condition and a value with only one character", () => {
        const rule = new ImportRule();

        rule.importRuleConditions.push(
            new ImportRuleCondition({condition: ImportRuleCondition.CONDITION_CONTAINS, value: "a"})
        );

        expect(ImportRule.calculateRank(rule)).toBe(1);
    });

    it("should return the length of the rule's condition's value when there is only one condition", () => {
        const rule = new ImportRule();

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                value: "test"
            })
        );

        expect(ImportRule.calculateRank(rule)).toBe(4);
    });

    it("should return the sum of all conditions values", () => {
        const rule = new ImportRule();

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                value: "test"
            })
        );

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                value: "test2"
            })
        );

        expect(ImportRule.calculateRank(rule)).toBe(9);
    });

    it("should multiply regex condition values by 1.5", () => {
        const rule = new ImportRule();

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_MATCHES,
                value: "test"
            })
        );

        expect(ImportRule.calculateRank(rule)).toBe(6);
    });

    it("should sum all condition values and multiply regex conditions by 1.5", () => {
        const rule = new ImportRule();

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_CONTAINS,
                value: "test"
            })
        );

        rule.importRuleConditions.push(
            new ImportRuleCondition({
                condition: ImportRuleCondition.CONDITION_MATCHES,
                value: "test"
            })
        );

        expect(ImportRule.calculateRank(rule)).toBe(10);
    });
});

describe("rankSortAsc", () => {
    it("should sort rules by rank, ascending", () => {
        const rules = [
            new ImportRule({
                importRuleConditions: [
                    new ImportRuleCondition({
                        condition: ImportRuleCondition.CONDITION_CONTAINS,
                        value: "test"
                    }),
                    new ImportRuleCondition({
                        condition: ImportRuleCondition.CONDITION_MATCHES,
                        value: "test2"
                    })
                ]
            }),
            new ImportRule({
                importRuleConditions: [
                    new ImportRuleCondition({
                        condition: ImportRuleCondition.CONDITION_CONTAINS,
                        value: "test2"
                    }),
                    new ImportRuleCondition({
                        condition: ImportRuleCondition.CONDITION_CONTAINS,
                        value: "test2"
                    })
                ]
            }),
            new ImportRule({
                importRuleConditions: [
                    new ImportRuleCondition({
                        condition: ImportRuleCondition.CONDITION_CONTAINS,
                        value: "test3"
                    })
                ]
            })
        ];

        const result = [...rules].sort(ImportRule.rankSortAsc);

        expect(result[0].id).toBe(rules[2].id);
        expect(result[1].id).toBe(rules[1].id);
        expect(result[2].id).toBe(rules[0].id);
    });
});

describe("diffRules", () => {
    it("can diff created, updated, and deleted actions/conditions between two rules", () => {
        const oldRule = new ImportRule({
            importRuleActionIds: ["1", "2", "3"],
            importRuleConditionIds: ["4", "5", "6"]
        });

        const newRule = new ImportRule({
            importRuleActionIds: ["1", "3", "0"],
            importRuleConditionIds: ["5", "6", "7"]
        });

        const diff = ImportRule.diffRules(oldRule, newRule);

        expect(diff.actions.created).toEqual(["0"]);
        expect(diff.actions.updated).toEqual(["1", "3"]);
        expect(diff.actions.deleted).toEqual(["2"]);

        expect(diff.conditions.created).toEqual(["7"]);
        expect(diff.conditions.updated).toEqual(["5", "6"]);
        expect(diff.conditions.deleted).toEqual(["4"]);
    });

    it("works when IDs are empty", () => {
        const oldRule = new ImportRule({
            importRuleActionIds: [],
            importRuleConditionIds: []
        });

        const newRule = new ImportRule({
            importRuleActionIds: [],
            importRuleConditionIds: []
        });

        const diff = ImportRule.diffRules(oldRule, newRule);

        expect(diff.actions.created).toEqual([]);
        expect(diff.actions.updated).toEqual([]);
        expect(diff.actions.deleted).toEqual([]);

        expect(diff.conditions.created).toEqual([]);
        expect(diff.conditions.updated).toEqual([]);
        expect(diff.conditions.deleted).toEqual([]);
    });
});
