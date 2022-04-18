import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import classNames from "classnames";
import React from "react";
import {smallViewport} from "utils/stories";
import OptionCard from "./OptionCard";

export default {
    title: "Atoms/Option Card",
    component: OptionCard
};

const clickAction = () => action("click");
const labelKnob = () => text("Label", "Asset");

/** An example of the 'base' (non active) view of an `OptionCard`. */
export const Base = () => (
    <OptionCard
        className="OptionCard--story-sample"
        active={boolean("Active", false)}
        onClick={clickAction()}
    >
        {labelKnob()}
    </OptionCard>
);

/** An example of the active view of an `OptionCard`. */
export const Active = () => (
    <OptionCard
        className="OptionCard--story-sample"
        active={boolean("Active", true)}
        onClick={clickAction()}
    >
        {labelKnob()}
    </OptionCard>
);

/** An example of the disabled view of an `OptionCard`. */
export const Disabled = () => (
    <OptionCard
        className="OptionCard--story-sample"
        active={boolean("Active", false)}
        disabled={boolean("Disabled", true)}
        onClick={clickAction()}
    >
        {labelKnob()}
    </OptionCard>
);

/** An example of a set of `OptionCard`s lined up as a picker. */
export const PickerExample = () => (
    <div className="OptionCard--story-container">
        <OptionCard onClick={clickAction()}>Asset</OptionCard>

        <OptionCard active={true} onClick={clickAction()}>
            Liability
        </OptionCard>

        <OptionCard onClick={clickAction()}>Income</OptionCard>

        <OptionCard onClick={clickAction()}>Expense</OptionCard>
    </div>
);

PickerExample.parameters = smallViewport;

/** An `OptionCard` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <OptionCard
        className={classNames("Element--story-FocusOutline", "OptionCard--story-sample")}
        active={boolean("Active", false)}
        onClick={clickAction()}
    >
        {labelKnob()}
    </OptionCard>
);
