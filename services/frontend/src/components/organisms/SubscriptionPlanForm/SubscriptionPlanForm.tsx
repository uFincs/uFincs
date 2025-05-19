import classNames from "classnames";
import {useCallback, useState} from "react";
import {Card, Divider, LinkButton, OverlineHeading} from "components/atoms";
import {RadioGroup, SubmitButton, SubscriptionPlan} from "components/molecules";
import {BillingService} from "services/";
import connect, {ConnectedProps} from "./connect";
import "./SubscriptionPlanForm.scss";

const PLAN_OPTIONS = BillingService.PLANS.map((plan) => {
    const Component = ({active}: {active?: boolean}) => (
        <SubscriptionPlan
            alternativePeriod={plan.alternativePeriod}
            alternativePrice={plan.alternativePrice}
            monthlyPrice={plan.monthlyPrice}
            name={plan.name}
            percentOff={plan.percentOff}
            selected={!!active}
            // Just need a function... selection is all handled by the RadioGroup.
            onSelected={() => {}}
        />
    );

    return {
        label: plan.name,
        value: plan.id,
        Component
    };
});

interface SubscriptionPlanFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form that allows a user to pick their subscription plan. */
const SubscriptionPlanForm = ({
    className,
    error,
    loading,
    onCancel,
    onCheckout
}: SubscriptionPlanFormProps) => {
    const [value, onChange] = useState<string>(BillingService.PLANS[0].id);

    const onSubmit = useCallback(() => onCheckout(value), [value, onCheckout]);

    return (
        <Card className={classNames("SubscriptionPlanForm", className)}>
            {/* Need to add this label for the RadioGroup.  */}
            <OverlineHeading id="subscription-plan-form-plans-label">
                Subscribe to uFincs
            </OverlineHeading>

            <RadioGroup
                className="SubscriptionPlanForm-plans"
                id="subscription-plan-form-plans"
                options={PLAN_OPTIONS}
                value={value}
                onChange={onChange}
            />

            <Divider />

            <div className="SubscriptionPlanForm-actions">
                <LinkButton disabled={loading} onClick={onCancel}>
                    Cancel
                </LinkButton>

                <SubmitButton
                    containerClassName="SubscriptionPlanForm-SubmitButton-container"
                    error={error}
                    loading={loading}
                    onClick={onSubmit}
                >
                    Checkout
                </SubmitButton>
            </div>
        </Card>
    );
};

export const PureComponent = SubscriptionPlanForm;
export const ConnectedSubscriptionPlanForm = connect(SubscriptionPlanForm);
export default ConnectedSubscriptionPlanForm;
