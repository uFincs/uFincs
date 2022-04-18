import React from "react";
import LargeButton from "./LargeButton";

export default {
    title: "Atoms/Large Button",
    component: LargeButton
};

/** The default view of `LargeButton`. */
export const Default = () => <LargeButton>CSV File</LargeButton>;

/** The disabled view of `LargeButton`. */
export const Disabled = () => <LargeButton disabled={true}>CSV File</LargeButton>;
