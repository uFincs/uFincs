import classNames from "classnames";
import React from "react";
import {
    AmountChange,
    CurrentAmount,
    FromAmount,
    OptionCard,
    TransactionTypeIcon
} from "components/atoms";
import {OptionCardProps} from "components/atoms/OptionCard";
import {Transaction, TransactionType} from "models/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import "./TransactionTypeOption.scss";

interface TransactionTypeOptionProps extends OptionCardProps {
    /** The (optional) current amount, for use when filtering transactions. */
    currentAmount?: Cents;

    /** The (optional) 'From' amount, for use when filtering transactions. */
    fromAmount?: Cents;

    /** The Transaction type for this option. */
    type: TransactionType;
}

/** A custom 'radio button' that can be used in a radio group for picking a Transaction's type. */
const TransactionTypeOption = React.forwardRef(
    (
        {
            className,
            active,
            currentAmount,
            fromAmount,
            type,
            ...otherProps
        }: TransactionTypeOptionProps,
        ref: React.Ref<HTMLDivElement>
    ) => {
        const hasAmounts = currentAmount !== undefined && fromAmount !== undefined;

        return (
            <OptionCard
                className={classNames(
                    "TransactionTypeOption",
                    {
                        "TransactionTypeOption--picker": !hasAmounts,
                        "TransactionTypeOption--filtering": hasAmounts
                    },
                    className
                )}
                ref={ref}
                active={active}
                {...otherProps}
            >
                {hasAmounts ? (
                    <FiltersLayout
                        active={active}
                        currentAmount={currentAmount}
                        fromAmount={fromAmount}
                        type={type}
                    />
                ) : (
                    <TypePickerLayout active={active} type={type} />
                )}
            </OptionCard>
        );
    }
);

/** This is the simplified layout used when choosing a type for a Transaction. */
const TypePickerLayout = ({active, type}: TransactionTypeOptionProps) => (
    <>
        <TransactionTypeIcon
            className="TransactionTypeOption-icon"
            lightShade={active}
            type={type}
        />

        <span>{ValueFormatting.capitalizeString(type)}</span>
    </>
);

/** This is the complete layout used when choosing the Transaction type filters for something
 *  like a Transactions list or table. */
const FiltersLayout = ({active, currentAmount, fromAmount, type}: TransactionTypeOptionProps) => (
    <>
        <div className="FiltersLayout-header">
            <div className="FiltersLayout-header-title">
                <p className={classNames({"FiltersLayout-type--active": active})}>
                    {Transaction.PLURAL_TYPES[type]}
                </p>

                <TransactionTypeIcon
                    className={classNames("TransactionTypeOption-icon", {
                        "TransactionTypeOption-icon--active": active
                    })}
                    lightShade={active}
                    type={type}
                />
            </div>

            <AmountChange
                className="FiltersLayout-percent"
                lightShade={active}
                positiveIsBad={type === Transaction.EXPENSE || type === Transaction.DEBT}
                oldAmount={fromAmount as Cents}
                newAmount={currentAmount as Cents}
            />
        </div>

        <CurrentAmount
            className="FiltersLayout-current-amount"
            amount={currentAmount as Cents}
            lightShade={active}
        />

        <FromAmount
            className="FiltersLayout-from-amount"
            amount={fromAmount as Cents}
            lightShade={active}
        />
    </>
);

/* Pre-bound versions for each Type */

export const TransactionTypeOptionIncome = React.forwardRef(
    (props: Omit<TransactionTypeOptionProps, "type">, ref: React.Ref<HTMLDivElement>) => (
        <TransactionTypeOption type={Transaction.INCOME} ref={ref} {...props} />
    )
);

export const TransactionTypeOptionExpense = React.forwardRef(
    (props: Omit<TransactionTypeOptionProps, "type">, ref: React.Ref<HTMLDivElement>) => (
        <TransactionTypeOption type={Transaction.EXPENSE} ref={ref} {...props} />
    )
);

export const TransactionTypeOptionDebt = React.forwardRef(
    (props: Omit<TransactionTypeOptionProps, "type">, ref: React.Ref<HTMLDivElement>) => (
        <TransactionTypeOption type={Transaction.DEBT} ref={ref} {...props} />
    )
);

export const TransactionTypeOptionTransfer = React.forwardRef(
    (props: Omit<TransactionTypeOptionProps, "type">, ref: React.Ref<HTMLDivElement>) => (
        <TransactionTypeOption type={Transaction.TRANSFER} ref={ref} {...props} />
    )
);

export default TransactionTypeOption;
