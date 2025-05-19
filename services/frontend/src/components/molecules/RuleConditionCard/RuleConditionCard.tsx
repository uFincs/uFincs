import classNames from "classnames";
import {useFormContext} from "react-hook-form";
import {FormCardContainer, SelectInput} from "components/atoms";
import {LabelledInput} from "components/molecules";
import {ImportRuleCondition} from "models/";
import {inputRules, ImportRuleFormData} from "values/importRuleForm";
import "./RuleConditionCard.scss";

const conditionOptions = [
    {label: "contains", value: ImportRuleCondition.CONDITION_CONTAINS},
    {label: "matches regex", value: ImportRuleCondition.CONDITION_MATCHES}
];

const propertyOptions = [
    {label: "Account", value: ImportRuleCondition.PROPERTY_ACCOUNT},
    {label: "Description", value: ImportRuleCondition.PROPERTY_DESCRIPTION}
];

interface RuleConditionCardProps {
    /** Custom class name. */
    className?: string;

    /** The default condition value to show. */
    defaultCondition?: string;

    /** The default property value to show. */
    defaultProperty?: string;

    /** The default value... value to show. */
    defaultValue?: string;

    /** The index of the condition within the list of conditions for a rule. */
    index?: number;

    /** Callback for removing the condition. */
    onRemove: () => void;
}

/** The card used to represent a Condition in the Import Rule form. */
const RuleConditionCard = ({
    className,
    defaultCondition = "",
    defaultProperty = "",
    defaultValue = "",
    index = 0,
    onRemove
}: RuleConditionCardProps) => (
    <FormCardContainer
        className={classNames("RuleConditionCard", className)}
        data-testid="rule-condition-card"
        bottomRowChildren={<BottomRow defaultValue={defaultValue} index={index} />}
        topRowChildren={
            <TopRow
                defaultCondition={defaultCondition}
                defaultProperty={defaultProperty}
                index={index}
            />
        }
        onRemove={onRemove}
    />
);

export default RuleConditionCard;

/** Other Components */

interface TopRowProps {
    /** The default condition value to show. */
    defaultCondition: string;

    /** The default property value to show. */
    defaultProperty: string;

    /** The index of the condition within the list of conditions for a rule. */
    index: number;
}

const TopRow = ({defaultCondition, defaultProperty, index}: TopRowProps) => {
    const {errors, getValues, register} = useFormContext<ImportRuleFormData>();

    return (
        <div className="RuleConditionCard-TopRow">
            <SelectInput
                name={`conditions[${index}].property`}
                aria-label="Property"
                title="Property"
                values={propertyOptions}
                defaultValue={defaultProperty}
                error={errors.conditions?.[index]?.property?.message}
                ref={register(inputRules.conditions.property(getValues))}
            />

            <SelectInput
                name={`conditions[${index}].condition`}
                aria-label="Condition"
                title="Condition"
                values={conditionOptions}
                defaultValue={defaultCondition}
                ref={register(inputRules.conditions.condition)}
            />
        </div>
    );
};

interface BottomRowProps {
    /** The default value... value to show. */
    defaultValue: string;

    /** The index of the condition within the list of conditions for a rule. */
    index: number;
}

const BottomRow = ({defaultValue, index}: BottomRowProps) => {
    const {errors, register} = useFormContext<ImportRuleFormData>();

    return (
        <div className="RuleConditionCard-BottomRow">
            <LabelledInput
                name={`conditions[${index}].value`}
                aria-label="Value"
                title="Value"
                label=""
                placeholder="APPLE"
                defaultValue={defaultValue}
                error={errors?.conditions?.[index]?.value?.message as string}
                ref={register(inputRules.conditions.value)}
            />
        </div>
    );
};
