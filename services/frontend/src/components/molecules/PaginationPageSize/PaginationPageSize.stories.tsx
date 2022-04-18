import React from "react";
import {PaginationProvider} from "hooks/";
import PaginationPageSize from "./PaginationPageSize";

export default {
    title: "Molecules/Pagination Page Size",
    component: PaginationPageSize
};

/** The default view of the `PaginationPageSize`. */
export const Default = () => (
    <PaginationProvider totalItems={100}>
        <PaginationPageSize />
    </PaginationProvider>
);
