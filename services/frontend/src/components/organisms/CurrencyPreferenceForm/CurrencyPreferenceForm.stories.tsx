import {text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {DefaultCurrency} from "values/currencies";
import {PureComponent as CurrencyPreferenceForm} from "./CurrencyPreferenceForm";

export default {
    title: "Organisms/Currency Preference Form",
    component: CurrencyPreferenceForm
};

/** The default view of `CurrencyPreferenceForm`. */
export const Default = () => {
    const [value, setValue] = useState(DefaultCurrency);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const onSave = (currency: string) => {
        setLoading(true);
        setValue(currency);

        setLoading(false);
        setError(null);
    };

    return (
        <CurrencyPreferenceForm
            currentCurrency={value}
            error={error || ""}
            loading={loading}
            onSave={onSave}
        />
    );
};

/** The error view of `CurrencyPreferenceForm`. */
export const Error = () => (
    <CurrencyPreferenceForm
        currentCurrency={DefaultCurrency}
        error={text("Error", "You dun goofed")}
        onSave={() => {}}
    />
);
