import {text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {Account} from "models/";
import {smallViewport} from "utils/stories";
import AccountTypePicker from "./AccountTypePicker";

export default {
    title: "Molecules/Account Type Picker",
    component: AccountTypePicker
};

const labelKnob = () => text("Label", "Type");

/** The default view of the `AccountTypePicker`. */
export const Default = () => {
    const [value, setValue] = useState<string>(Account.ASSET);

    return (
        <AccountTypePicker
            id="Story-AccountTypePicker"
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};

/** An example of the `AccountTypePicker` with fewer types to pick from. */
export const FewerTypes = () => {
    const [value, setValue] = useState<string>(Account.ASSET);

    return (
        <AccountTypePicker
            id="Story-AccountTypePicker"
            label={labelKnob()}
            typesToShow={[Account.ASSET, Account.LIABILITY]}
            value={value}
            onChange={setValue}
        />
    );
};

/** The small (mobile) view of the `AccountTypePicker`.
 *
 *  This is the more realistic view, since the picker is primarily used in the `AccountForm`,
 *  which has a very constrained width (being in the Sidebar and all). */
export const Small = () => {
    const [value, setValue] = useState<string>(Account.ASSET);

    return (
        <AccountTypePicker
            id="Story-AccountTypePicker"
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};

Small.parameters = smallViewport;

/** The disabled view of the `AccountTypePicker`. */
export const Disabled = () => {
    const [value, setValue] = useState<string>(Account.ASSET);

    return (
        <AccountTypePicker
            id="Story-AccountTypePicker"
            disabled={true}
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};
