import React from "react";
import {useForm, FormProvider} from "react-hook-form";
import RecurringDateForm from "./RecurringDateForm";

export default {
    title: "Molecules/Recurring Date Form",
    component: RecurringDateForm
};

/** The default view of `RecurringDateForm`. */
export const Default = () => {
    const methods = useForm();

    return (
        <FormProvider {...methods}>
            <RecurringDateForm />
        </FormProvider>
    );
};
