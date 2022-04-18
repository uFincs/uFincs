import classNames from "classnames";
import React from "react";
import {useFormContext} from "react-hook-form";
import {FormCardContainer, SelectInput} from "components/atoms";
import {LabelledInput} from "components/molecules";
import {useAccountOptions} from "hooks/";
import {Account, AccountType, ImportRuleAction, ImportRuleActionProperty} from "models/";
import {inputRules, ImportRuleFormData} from "values/importRuleForm";
import {transactionTypeOptions} from "values/transactionTypeOptions";
import connect, {ConnectedProps} from "./connect";
import "./RuleActionCard.scss";

const propertyOptions = [
    {label: "Account", value: ImportRuleAction.PROPERTY_ACCOUNT},
    {label: "Description", value: ImportRuleAction.PROPERTY_DESCRIPTION},
    {label: "Type", value: ImportRuleAction.PROPERTY_TYPE}
];

interface RuleActionCardProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The default property value to show. */
    defaultProperty?: string;

    /** The default value... value to show. */
    defaultValue?: string;

    /** The index of the condition within the list of conditions for a rule. */
    index?: number;

    /** Callback for removing the action. */
    onRemove: () => void;
}

/** The card used to represent a Condition in the Import Rule form. */
const RuleActionCard = ({
    className,
    accountsByType,
    defaultProperty = "",
    defaultValue = "",
    index = 0,
    onRemove
}: RuleActionCardProps) => (
    <FormCardContainer
        className={classNames("RuleActionCard", className)}
        data-testid="rule-action-card"
        bottomRowChildren={
            <BottomRow accountsByType={accountsByType} defaultValue={defaultValue} index={index} />
        }
        topRowChildren={<TopRow defaultProperty={defaultProperty} index={index} />}
        onRemove={onRemove}
    />
);

export const PureComponent = RuleActionCard;
export default connect(RuleActionCard);

/** Other Components */

interface TopRowProps {
    /** The default property value to show. */
    defaultProperty: string;

    /** The index of the condition within the list of conditions for a rule. */
    index: number;
}

const TopRow = ({defaultProperty, index}: TopRowProps) => {
    const {getValues, errors, register} = useFormContext<ImportRuleFormData>();

    return (
        <div className="RuleActionCard-TopRow">
            <SelectInput
                name={`actions[${index}].property`}
                aria-label="Property"
                title="Property"
                values={propertyOptions}
                defaultValue={defaultProperty}
                error={errors.actions?.[index]?.property?.message}
                ref={register(inputRules.actions.property(getValues))}
            />

            <p>
                <strong>to</strong>
            </p>
        </div>
    );
};

interface BottomRowProps {
    /** The map of all accounts by their type. Used for the Account option input. */
    accountsByType: Record<AccountType, Array<Account>>;

    /** The default value... value to show. */
    defaultValue: string;

    /** The index of the condition within the list of conditions for a rule. */
    index: number;
}

const BottomRow = ({accountsByType, defaultValue, index}: BottomRowProps) => {
    const {errors, register, watch} = useFormContext<ImportRuleFormData>();

    const accountOptions = useAccountOptions(Account.ACCOUNT_TYPES, accountsByType);
    const propertyValue = watch(`actions[${index}].property`) as ImportRuleActionProperty;

    const errorMessage = errors?.actions?.[index]?.value?.message as string;

    const renderedInput = (() => {
        switch (propertyValue) {
            case ImportRuleAction.PROPERTY_ACCOUNT:
                return (
                    <SelectInput
                        name={`actions[${index}].value`}
                        aria-label="Value"
                        title="Value"
                        values={accountOptions}
                        defaultValue={accountOptions?.[0]?.value}
                        error={errorMessage}
                        ref={register(inputRules.actions.value)}
                    />
                );
            case ImportRuleAction.PROPERTY_DESCRIPTION:
                return (
                    <LabelledInput
                        name={`actions[${index}].value`}
                        aria-label="Value"
                        title="Value"
                        label=""
                        placeholder="APPLE"
                        defaultValue={defaultValue}
                        error={errorMessage}
                        ref={register(inputRules.actions.value)}
                    />
                );
            case ImportRuleAction.PROPERTY_TYPE:
                return (
                    <SelectInput
                        name={`actions[${index}].value`}
                        aria-label="Value"
                        title="Value"
                        values={transactionTypeOptions}
                        defaultValue={transactionTypeOptions[0].value}
                        error={errorMessage}
                        ref={register(inputRules.actions.value)}
                    />
                );
        }
    })();

    return <div className="RuleActionCard-BottomRow">{renderedInput}</div>;
};
