import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as CurrencyPreferenceForm} from "./CurrencyPreferenceForm";

const meta: Meta<typeof CurrencyPreferenceForm> = {
    title: "Organisms/Currency Preference Form",
    component: CurrencyPreferenceForm,
    args: {
        currentCurrency: "USD",
        error: "",
        loading: false
    }
};

export default meta;
type Story = StoryObj<typeof CurrencyPreferenceForm>;

/** The default view of `CurrencyPreferenceForm`. */
export const Default: Story = {
    args: {}
};

/** The error view of `CurrencyPreferenceForm`. */
export const Error: Story = {
    args: {
        error: "You dun goofed"
    }
};
