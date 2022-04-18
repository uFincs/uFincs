import classNames from "classnames";
import React from "react";
import {Controller} from "react-hook-form";
import {Thinking} from "assets/graphics";
import {
    AccountTypePicker,
    // TODO: Uncomment once we bring back Account interest.
    // CollapsibleSection,
    EmptyArea,
    FormContainer,
    LabelledInput
} from "components/molecules";
import {useCurrencySymbol} from "hooks/";
import {Account, AccountType} from "models/";
import connect, {ConnectedProps} from "./connect";
import {useAccountForm} from "./hooks";
import "./AccountForm.scss";

const mapTypeToPlaceholder = {
    [Account.ASSET]: "e.g. Chequing",
    [Account.LIABILITY]: "e.g. Credit Card",
    [Account.INCOME]: "e.g. Salary",
    [Account.EXPENSE]: "e.g. Groceries"
};
interface AccountFormProps extends ConnectedProps {}

/** A form for creating or editing an Account. */
const AccountForm = ({
    className,
    accountForEditing,
    isEditing,
    onClose,
    onSubmit,
    onNewAccount
}: AccountFormProps) => {
    const currencySymbol = useCurrencySymbol();

    const {
        control,
        errors,
        typeInputValue,
        submissionError,
        registerNameInput,
        registerOpeningBalanceInput,
        // TODO: Uncomment once we bring back Account interest.
        // registerInterestInput,
        formOnSubmit,
        formOnKeyDown,
        onMakeAnother
    } = useAccountForm(accountForEditing, onSubmit, onClose);

    return isEditing && !accountForEditing ? (
        <FormContainer
            className={classNames("AccountForm", className)}
            closeButtonTestId="account-form-close-button"
            entityName="Account"
            isEditing={isEditing}
            isInvalidForm={true}
            onClose={onClose}
        >
            <InvalidAccountForEditing onNewAccount={onNewAccount} />
        </FormContainer>
    ) : (
        <FormContainer
            className={classNames("AccountForm", className)}
            data-testid="account-form"
            closeButtonTestId="account-form-close-button"
            entityName="Account"
            isEditing={isEditing}
            submissionError={submissionError}
            onClose={onClose}
            onMakeAnother={onMakeAnother}
            onSubmit={formOnSubmit}
            onKeyDown={formOnKeyDown}
        >
            <div className="AccountForm-inputs">
                <Controller
                    name="type"
                    render={({value, onChange}) => (
                        <AccountTypePicker
                            id="AccountForm-type-picker"
                            label="What type of account is this?"
                            autoFocus={!isEditing}
                            disabled={isEditing}
                            title={
                                isEditing
                                    ? "Can't change type of existing account; must create new account."
                                    : ""
                            }
                            value={value}
                            onChange={onChange}
                        />
                    )}
                    control={control}
                    defaultValue={Account.ASSET}
                />

                <LabelledInput
                    name="name"
                    type="text"
                    label="Name"
                    placeholder={mapTypeToPlaceholder[typeInputValue]}
                    autoFocus={isEditing}
                    error={errors?.name?.message as string}
                    ref={registerNameInput}
                />

                {Account.hasOpeningBalanceAndInterest(typeInputValue as AccountType) && (
                    <>
                        <LabelledInput
                            name="openingBalance"
                            type="number"
                            min="0.00"
                            step="0.01"
                            label="Opening Balance"
                            placeholder="3.50"
                            prefix={currencySymbol}
                            title={
                                isEditing ? "Can't change opening balance of existing account" : ""
                            }
                            disabled={isEditing}
                            error={errors?.openingBalance?.message as string}
                            ref={registerOpeningBalanceInput}
                        />

                        {/* TODO: Uncomment once we bring back Account interest. */}
                        {/* <CollapsibleSection
                            id="AccountForm-optional-details"
                            label="Optional details"
                            openByDefault={accountForEditing && accountForEditing.interest > 0}
                        >
                            <LabelledInput
                                containerClassName="AccountForm-input"
                                name="interest"
                                min="0.000"
                                step="0.001"
                                type="number"
                                label="Interest Rate"
                                placeholder="1.350"
                                prefix="%"
                                error={errors?.interest?.message as string}
                                ref={registerInterestInput}
                            />
                        </CollapsibleSection> */}
                    </>
                )}
            </div>
        </FormContainer>
    );
};

export const PureComponent = AccountForm;
export default connect(AccountForm);

/* Other Components */

interface InvalidAccountForEditingProps {
    /** Handler for redirecting the user to the New Account form. */
    onNewAccount: () => void;
}

/** The view to show when the user is trying to edit an invalid account.
 *  It should prompt the user to instead try creating an account. */
const InvalidAccountForEditing = ({onNewAccount}: InvalidAccountForEditingProps) => (
    <EmptyArea
        className="AccountForm-EmptyArea"
        Graphic={Thinking}
        title="This isn't an account?"
        message="Hmm, doesn't seem like there's an account here."
        subMessage="How about creating a new one instead?"
        actionLabel="New Account"
        onClick={onNewAccount}
    />
);
