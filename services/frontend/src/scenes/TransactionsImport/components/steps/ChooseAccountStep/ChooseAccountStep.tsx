import classNames from "classnames";
import {useEffect, useMemo, useRef, useState} from "react";
import {TextField} from "components/atoms";
import {AccountTypePicker, LabelledSelectInput, StepDescription} from "components/molecules";
import {useAccountOptions} from "hooks/";
import {Account, AccountType} from "models/";
import {StepNavigationFooter} from "../..";
import connect, {ConnectedProps} from "./connect";
import "./ChooseAccountStep.scss";

const ACCOUNT_TYPE_OPTIONS = [Account.ASSET, Account.LIABILITY];

interface ChooseAccountStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The first step of the Transactions Import process, the Choose Account step is where
 *  the user chooses to which account they'll be importing their transactions to. */
const ChooseAccountStep = ({
    className,
    accountId,
    accountType: initialAccountType,
    accountsByType,
    saveAccountId
}: ChooseAccountStepProps) => {
    const firstRenderHappenedRef = useRef(false);

    const [accountType, setAccountType] = useState<string>(
        initialAccountType || ACCOUNT_TYPE_OPTIONS[0]
    );

    const accountOptions = useAccountOptions([accountType as AccountType], accountsByType);
    const accountOptionsWithEmpty = useMemo(
        () => [{label: "", value: ""}, ...accountOptions],
        [accountOptions]
    );

    useEffect(() => {
        // We don't want to accidentally clear the store's account ID during the first render.
        // This can happen when the user goes back to the first step after having filled it out.
        if (firstRenderHappenedRef.current) {
            // Want to clear account whenever the type changes.
            saveAccountId("");
        } else {
            firstRenderHappenedRef.current = true;
        }
    }, [accountType, saveAccountId]);

    return (
        <>
            <div
                className={classNames("ChooseAccountStep", className)}
                data-testid="choose-account-step"
            >
                <StepDescription title="Where are your transactions going?">
                    <TextField>
                        You first need to choose the <strong>account</strong> that your transactions
                        will be <strong>imported to</strong>.
                    </TextField>
                </StepDescription>

                <div className="ChooseAccountStep-body">
                    <AccountTypePicker
                        id="ChooseAccountStep-AccountTypePicker"
                        label="Account Type"
                        typesToShow={ACCOUNT_TYPE_OPTIONS}
                        value={accountType}
                        onChange={setAccountType}
                    />

                    <LabelledSelectInput
                        data-testid="choose-account-step-account-input"
                        label="Account"
                        placeholder="Select an account"
                        value={accountId}
                        values={accountOptionsWithEmpty}
                        onChange={(e) => saveAccountId(e.target.value)}
                    />
                </div>
            </div>

            <StepNavigationFooter />
        </>
    );
};

const ConnectedChooseAccountStep = connect(ChooseAccountStep);
export default ConnectedChooseAccountStep;
