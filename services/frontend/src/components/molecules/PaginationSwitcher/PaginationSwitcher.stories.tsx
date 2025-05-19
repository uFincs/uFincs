import {Meta, StoryObj} from "@storybook/react";
import {PaginationProvider, PaginationUrlProvider} from "hooks/";
import PaginationSwitcher from "./PaginationSwitcher";

const meta: Meta<typeof PaginationSwitcher> = {
    title: "Molecules/Pagination Switcher",
    component: PaginationSwitcher,
    args: {
        // Default args if needed
    }
};

export default meta;
type Story = StoryObj<typeof PaginationSwitcher>;

/** The default view of a `PaginationSwitcher`, tested with the internal context provider. */
export const InternalState: Story = {
    args: {
        // Any specific args for this story
    },
    render: () => (
        <PaginationProvider totalItems={100}>
            <PaginationSwitcher />
        </PaginationProvider>
    )
};

/** The default view of a `PaginationSwitcher`, tested with the url context provider. */
export const UrlState: Story = {
    args: {
        // Any specific args for this story
    },
    render: () => (
        <PaginationUrlProvider totalItems={100}>
            <PaginationSwitcher />
        </PaginationUrlProvider>
    )
};

/** Checks that the pagination works correctly when there aren't any items to paginate.
 *  It should display that there is only 1 'page'. */
export const ZeroItems: Story = {
    args: {
        // Any specific args for this story
    },
    render: () => (
        <PaginationProvider totalItems={0}>
            <PaginationSwitcher />
        </PaginationProvider>
    )
};

/** Checks that the pagination works correctly when there is only 1 item.
 *  It should display that there is only 1 page. */
export const OneItem: Story = {
    args: {
        // Any specific args for this story
    },
    render: () => (
        <PaginationProvider totalItems={1}>
            <PaginationSwitcher />
        </PaginationProvider>
    )
};

/** Checks that the pagination works correctly even when something goes horribly wrong
 *  and there are _negative_ total items!.
 *  This should be treated just like 0 items. */
export const NegativeItems: Story = {
    args: {
        // Any specific args for this story
    },
    render: () => (
        <PaginationProvider totalItems={-100}>
            <PaginationSwitcher />
        </PaginationProvider>
    )
};
