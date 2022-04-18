import classNames from "classnames";
import React, {useMemo} from "react";
import {useFormContext} from "react-hook-form";
import {SelectInput} from "components/atoms";
import {LabelledInput} from "components/molecules";
import {RecurringTransaction} from "models/";
import {DateService} from "services/";
import {inputRules, TransactionFormData} from "values/transactionForm";
import {
    FREQ_OPTIONS,
    WEEKDAYS,
    MONTH_DAYS,
    MONTHS,
    END_CONDITIONS
} from "./recurringDateFormOptions";
import "./RecurringDateForm.scss";

interface RecurringDateFormProps {
    /** Custom class name. */
    className?: string;
}

/** The form that enables a user to specify a recurring date schedule for a transaction. */
const RecurringDateForm = ({className}: RecurringDateFormProps) => {
    const {errors, getValues, register, watch} = useFormContext<TransactionFormData>();

    const frequencyValue = watch("freq", FREQ_OPTIONS[0].value);
    const onMonthValue = watch("onMonth", MONTHS[0].value);
    const endConditionValue = watch("endCondition", END_CONDITIONS[0].value);

    const daysInMonth = useMemo(() => DateService.getDaysInMonth(onMonthValue), [onMonthValue]);

    const daysForMonth = useMemo(
        () =>
            [...Array(daysInMonth).keys()].map((day) => ({
                label: `${day + 1}`,
                value: `${day + 1}`
            })),
        [daysInMonth]
    );

    return (
        <div className={classNames("RecurringDateForm", className)}>
            <p>This transaction happens</p>

            <div
                className={classNames("RecurringDateForm-line", {
                    "RecurringDateForm-line--error": errors?.interval?.message
                })}
            >
                <p>
                    <strong>every</strong>
                </p>

                <LabelledInput
                    containerClassName="RecurringDateForm-number-input"
                    aria-label="Interval"
                    label=""
                    title="Interval"
                    name="interval"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={1}
                    error={errors?.interval?.message}
                    noErrorIcon={true}
                    ref={register(inputRules.recurringDate.interval(getValues))}
                />

                <SelectInput
                    containerClassName="RecurringDateForm-frequency-input"
                    name="freq"
                    aria-label="Frequency"
                    title="Frequency"
                    defaultValue={RecurringTransaction.FREQUENCIES.daily}
                    values={FREQ_OPTIONS}
                    ref={register(inputRules.recurringDate.frequency(getValues))}
                />

                {frequencyValue === `${RecurringTransaction.FREQUENCIES.daily}` && (
                    <p className="RecurringDateForm-text">.</p>
                )}
            </div>

            {frequencyValue !== `${RecurringTransaction.FREQUENCIES.daily}` && (
                <div className="RecurringDateForm-line">
                    <p>
                        <strong>on</strong>
                    </p>

                    {frequencyValue === `${RecurringTransaction.FREQUENCIES.weekly}` && (
                        <SelectInput
                            containerClassName="RecurringDateForm-weekday-input"
                            name="onWeekday"
                            aria-label="On weekday"
                            title="On weekday"
                            defaultValue={WEEKDAYS[0].value}
                            values={WEEKDAYS}
                            ref={register(inputRules.recurringDate.onWeekday(getValues))}
                        />
                    )}

                    {frequencyValue === `${RecurringTransaction.FREQUENCIES.monthly}` && (
                        <>
                            <p className="RecurringDateForm-text">the</p>

                            <SelectInput
                                containerClassName="RecurringDateForm-monthday-input"
                                name="onMonthday"
                                aria-label="On month day"
                                title="On month day"
                                defaultValue={MONTH_DAYS[0].value}
                                values={MONTH_DAYS}
                                ref={register(inputRules.recurringDate.onMonthday(getValues))}
                            />
                        </>
                    )}

                    {frequencyValue === `${RecurringTransaction.FREQUENCIES.yearly}` && (
                        <>
                            <SelectInput
                                containerClassName="RecurringDateForm-month-input"
                                name="onMonth"
                                aria-label="On Month"
                                title="On Month"
                                defaultValue={MONTHS[0].value}
                                values={MONTHS}
                                ref={register(inputRules.recurringDate.onYearMonth(getValues))}
                            />

                            <SelectInput
                                containerClassName="RecurringDateForm-day-input"
                                name="onDay"
                                aria-label="On Day"
                                title="On Day"
                                defaultValue={daysForMonth[0].value}
                                values={daysForMonth}
                                ref={register(inputRules.recurringDate.onYearDay(getValues))}
                            />
                        </>
                    )}

                    <p className="RecurringDateForm-text">.</p>
                </div>
            )}

            <div
                className={classNames("RecurringDateForm-line", {
                    "RecurringDateForm-line--error": errors?.startDate?.message
                })}
            >
                <p>
                    It should <strong>start on</strong>
                </p>

                <LabelledInput
                    containerClassName="RecurringDateForm-date-input RecurringDateForm-start-date-input"
                    aria-label="Start date"
                    label=""
                    title="Start date"
                    defaultValue={DateService.getTodayAsUTCString()}
                    name="startDate"
                    type="date"
                    error={errors?.startDate?.message}
                    noErrorIcon={true}
                    ref={register(inputRules.recurringDate.startDate(getValues))}
                />
            </div>

            <div
                className={classNames("RecurringDateForm-line", {
                    "RecurringDateForm-line--long-error":
                        errors?.count?.message || errors?.endDate?.message
                })}
            >
                <p>
                    and <strong>end</strong>
                </p>

                <SelectInput
                    containerClassName="RecurringDateForm-end-condition-input"
                    name="endCondition"
                    aria-label="End condition"
                    title="End condition"
                    defaultValue={END_CONDITIONS[0].value}
                    values={END_CONDITIONS}
                    ref={register(inputRules.recurringDate.endCondition(getValues))}
                />

                {endConditionValue === "after" && (
                    <>
                        <LabelledInput
                            containerClassName="RecurringDateForm-number-input"
                            aria-label="Count"
                            label=""
                            title="Count"
                            name="count"
                            type="number"
                            defaultValue={1}
                            error={errors?.count?.message}
                            noErrorIcon={true}
                            ref={register(inputRules.recurringDate.count(getValues))}
                        />

                        <p>times.</p>
                    </>
                )}

                {endConditionValue === "on" && (
                    <LabelledInput
                        containerClassName="RecurringDateForm-date-input RecurringDateForm-end-date-input"
                        aria-label="End Date"
                        label=""
                        title="End Date"
                        defaultValue={DateService.getTodayAsUTCString()}
                        name="endDate"
                        type="date"
                        error={errors?.endDate?.message}
                        noErrorIcon={true}
                        ref={register(inputRules.recurringDate.endDate(getValues))}
                    />
                )}

                {(endConditionValue === "on" || endConditionValue === "never") && (
                    <p className="RecurringDateForm-text">.</p>
                )}
            </div>
        </div>
    );
};

export default RecurringDateForm;
