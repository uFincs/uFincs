import classNames from "classnames";
import {TextField} from "components/atoms";
import {SubmitButton} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./Billing.scss";

interface BillingProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The section of the Settings for dealing with subscription billing, particularly by accessing
 *  the Customer Portal. */
const Billing = ({className, error, loading, gotoCustomerPortal}: BillingProps) => (
    <div className={classNames("Billing", className)}>
        <h3 className="Billing-header">Access the Customer Portal</h3>

        <TextField className="Billing-TextField">
            You can view the status of your subscription, update your payment details, and more
            using the Customer Portal.
        </TextField>

        <SubmitButton
            containerClassName="Billing-SubmitButton"
            data-testid="billing-goto-customer-portal"
            error={error}
            loading={loading}
            onClick={gotoCustomerPortal}
        >
            Go to Customer Portal
        </SubmitButton>
    </div>
);

export const PureComponent = Billing;
const ConnectedBilling = connect(Billing);
export default ConnectedBilling;
