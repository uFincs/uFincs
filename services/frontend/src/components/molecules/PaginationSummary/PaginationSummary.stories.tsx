import {number, text} from "@storybook/addon-knobs";
import React from "react";
import {PaginationSwitcher} from "components/molecules";
import {PaginationProvider} from "hooks/";
import PaginationSummary from "./PaginationSummary";

export default {
    title: "Molecules/Pagination Summary",
    component: PaginationSummary
};

const totalKnob = (defaultTotal: number = 500) => number("Total Items", defaultTotal);
const nameKnob = () => text("Item Name", "transactions");

const BaseStory = ({defaultTotal = 500}) => (
    <PaginationProvider totalItems={totalKnob(defaultTotal)}>
        <PaginationSummary itemName={nameKnob()} />

        {/* This is just for testing purposes. */}
        <PaginationSwitcher />
    </PaginationProvider>
);

/** The default view of `PaginationSummary`. */
export const Default = () => <BaseStory />;

/** `PaginationSummary` when there are 0 items for paginating.
 *  The message should have 0s for all of the numbers (start, end, and total). */
export const ZeroItems = () => <BaseStory defaultTotal={0} />;

/** `PaginationSummary` when there is exactly 1 item for paginating.
 *  Just some boundary checking. */
export const OneItem = () => <BaseStory defaultTotal={1} />;

/** `PaginationSummary` when there are, somehow, _negative_ items for paginating!
 *  This should be treated just like 0 items. */
export const NegativeItems = () => <BaseStory defaultTotal={-100} />;
