import {number} from "@storybook/addon-knobs";
import React from "react";
import {PaginationProvider, PaginationUrlProvider} from "hooks/";
import PaginationSwitcher from "./PaginationSwitcher";

export default {
    title: "Molecules/Pagination Switcher",
    component: PaginationSwitcher
};

const totalItemsKnob = () => number("Total Items", 100);

/** The default view of a `PaginationSwitcher`, tested with the internal context provider. */
export const InternalState = () => (
    <PaginationProvider totalItems={totalItemsKnob()}>
        <PaginationSwitcher />
    </PaginationProvider>
);

/** The default view of a `PaginationSwitcher`, tested with the url context provider. */
export const UrlState = () => (
    // Note: This won't actually change the URL when viewed in Storybook, because the history
    // for react-router is separate from the history used in Storybook.
    //
    // That being said, the Switcher still _works_ because the history state is still
    // being changed, it just isn't tied to the browser history.
    <PaginationUrlProvider totalItems={totalItemsKnob()}>
        <PaginationSwitcher />
    </PaginationUrlProvider>
);

/** Checks that the pagination works correctly when there aren't any items to paginate.
 *  It should display that there is only 1 'page'. */
export const ZeroItems = () => (
    <PaginationProvider totalItems={0}>
        <PaginationSwitcher />
    </PaginationProvider>
);

/** Checks that the pagination works correctly when there is only 1 item.
 *  It should display that there is only 1 page. */
export const OneItem = () => (
    <PaginationProvider totalItems={1}>
        <PaginationSwitcher />
    </PaginationProvider>
);

/** Checks that the pagination works correctly even when something goes horribly wrong
 *  and there are _negative_ total items!.
 *  This should be treated just like 0 items. */
export const NegativeItems = () => (
    <PaginationProvider totalItems={-100}>
        <PaginationSwitcher />
    </PaginationProvider>
);
