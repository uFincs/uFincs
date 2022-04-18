import React from "react";
import Divider from "./Divider";

export default {
    title: "Atoms/Divider",
    component: Divider
};

/** What the horizontal `Divider` looks like. */
export const Horizontal = () => <Divider orientation="horizontal" />;

/** What the vertical `Divider` looks like. */
export const Vertical = () => <Divider orientation="vertical" />;
