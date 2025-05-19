import classNames from "classnames";
import * as React from "react";
import {StepDescription} from "components/molecules";
import {SelectableAccountsList} from "components/organisms";
import {ValueFormatting} from "services/";
import StepNavigationFooter from "../StepNavigationFooter";
import connect, {ConnectedProps} from "./connect";
import "./BaseStep.scss";

interface BaseStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The 'children' is supposed to be a TextField containing the step's description. */
    children: React.ReactNode;
}

/** The base layout for a step. */
const BaseStep = ({
    className,
    children,
    accounts,
    selectedAccounts,
    type,
    onAddAccount,
    onSelectAccount,
    onValueChange
}: BaseStepProps) => (
    <>
        <div className={classNames("BaseStep", className)}>
            <StepDescription
                title={`Customize your ${ValueFormatting.capitalizeString(type)} Accounts`}
            >
                {children}
            </StepDescription>

            <div className="BaseStep-body">
                <SelectableAccountsList
                    accounts={accounts}
                    selectedAccounts={selectedAccounts}
                    type={type}
                    onAddAccount={onAddAccount}
                    onSelectAccount={onSelectAccount}
                    onValueChange={onValueChange}
                />
            </div>
        </div>

        <StepNavigationFooter />
    </>
);

const ConnectedBaseStep = connect(BaseStep);
export default ConnectedBaseStep;
