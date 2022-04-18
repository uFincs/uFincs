import classNames from "classnames";
import React, {useMemo} from "react";
import {useFormContext, Controller} from "react-hook-form";
import {LabelledInput, RecurringDateForm, TabBarWithSections} from "components/molecules";
import {DateService} from "services/";
import {inputRules, DateOption} from "values/transactionForm";
import "./TransactionDateOptions.scss";

const DATE_OPTIONS = [
    {
        label: "One-Off",
        labelId: "transaction-date-options-tab-one-off",
        controlsId: "transaction-date-options-one-off"
    },
    {
        label: "Recurring",
        labelId: "transaction-date-options-tab-recurring",
        controlsId: "transaction-date-options-recurring"
    }
];

interface TransactionDateOptionsProps {
    /** Custom class name. */
    className?: string;

    /** Which date options to display. */
    options?: Array<DateOption>;
}

/** Gives the user ability to set the date of a transaction as either a one-off or create
 *  a recurring schedule for it. */
const TransactionDateOptions = ({
    className,
    options = [DateOption.oneOff, DateOption.recurring],
    ...otherProps
}: TransactionDateOptionsProps) => {
    const {control} = useFormContext();

    const dateOptions = useMemo(() => options.map((option) => DATE_OPTIONS[option]), [options]);

    return (
        <div className={classNames("TransactionDateOptions", className)} {...otherProps}>
            <Controller
                control={control}
                name="dateOption"
                defaultValue={DateOption.oneOff}
                render={({value, onChange}) => (
                    <TabBarWithSections
                        // Checking for how many options is kinda a hack.
                        //
                        // See, we want to store the `dateOption` in the form state so that we
                        // know which type of transaction we're dealing with, but this doesn't really work
                        // when editing a transaction, since we only display one of the options, but
                        // still specify the `dateOption`. As such, we just kinda hard-code in that
                        // "when there's only 1 option, always take it, regardless of value".
                        //
                        // Maybe we shouldn't have tied the currently selected date option to the
                        // transaction type after all...
                        activeTab={options.length === 1 ? 0 : value}
                        tabs={dateOptions}
                        setActiveTab={options.length === 1 ? () => {} : onChange}
                    >
                        {options.includes(DateOption.oneOff) && <FormDateInput key="one-off" />}
                        {options.includes(DateOption.recurring) && (
                            <RecurringDateForm key="recurring" />
                        )}
                    </TabBarWithSections>
                )}
            />
        </div>
    );
};

export default TransactionDateOptions;

/* Other Components */

const FormDateInput = () => {
    const {errors, getValues, register} = useFormContext();

    return (
        <LabelledInput
            containerClassName="TransactionDateOptions-one-off-input"
            label="Date"
            name="date"
            type="date"
            defaultValue={DateService.getTodayAsUTCString()}
            error={errors?.date?.message as string}
            ref={register(inputRules.date(getValues))}
        />
    );
};
