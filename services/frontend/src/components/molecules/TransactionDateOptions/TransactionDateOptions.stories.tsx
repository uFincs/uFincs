import React from "react";
import {useForm, FormProvider} from "react-hook-form";
import {DateOption} from "values/transactionForm";
import TransactionDateOptions from "./TransactionDateOptions";

export default {
    title: "Molecules/Transaction Date Options",
    component: TransactionDateOptions
};

/** An example of how to use the `TransactionDateOptions` with react-hook-form. */
export const ReactHookForm = () => {
    const methods = useForm();

    return (
        <FormProvider {...methods}>
            <TransactionDateOptions />
        </FormProvider>
    );
};

/** An example of showing only the 'one-off' option. */
export const OnlyOneOff = () => {
    const methods = useForm();

    return (
        <FormProvider {...methods}>
            <TransactionDateOptions options={[DateOption.oneOff]} />
        </FormProvider>
    );
};

/** An example of showing only the 'recurring' option. */
export const OnlyRecurring = () => {
    const methods = useForm();

    return (
        <FormProvider {...methods}>
            <TransactionDateOptions options={[DateOption.recurring]} />
        </FormProvider>
    );
};
