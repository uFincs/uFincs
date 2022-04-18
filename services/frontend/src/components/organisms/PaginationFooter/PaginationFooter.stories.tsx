import {number} from "@storybook/addon-knobs";
import React from "react";
import {PaginationProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import PaginationFooter from "./PaginationFooter";

export default {
    title: "Organisms/Pagination Footer",
    component: PaginationFooter
};

const totalItemsKnob = () => number("Total Items", 100);

/** The default view of the `PaginationFooter`. */
export const Default = () => (
    <PaginationProvider totalItems={totalItemsKnob()}>
        <PaginationFooter />
    </PaginationProvider>
);

/** The small view of the `PaginationFooter`. */
export const Small = () => (
    <PaginationProvider totalItems={totalItemsKnob()}>
        <PaginationFooter />
    </PaginationProvider>
);

Small.parameters = smallViewport;
