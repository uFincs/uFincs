import type {Meta, StoryObj} from "@storybook/react";
import {PaginationProvider} from "hooks/";
import PaginationPageSize from "./PaginationPageSize";

const meta: Meta<typeof PaginationPageSize> = {
    title: "Molecules/Pagination Page Size",
    component: PaginationPageSize
};

export default meta;
type Story = StoryObj<typeof PaginationPageSize>;

/** The default view of the `PaginationPageSize`. */
export const Default: Story = {
    args: {},
    render: () => (
        <PaginationProvider totalItems={100}>
            <PaginationPageSize />
        </PaginationProvider>
    )
};
