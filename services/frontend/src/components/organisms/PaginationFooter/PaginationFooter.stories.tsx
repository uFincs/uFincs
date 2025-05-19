import {Meta, StoryObj} from "@storybook/react";
import {PaginationProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import PaginationFooter from "./PaginationFooter";

const meta: Meta<typeof PaginationFooter> = {
    title: "Organisms/Pagination Footer",
    component: PaginationFooter,
    decorators: [
        (Story) => (
            <PaginationProvider totalItems={100}>
                <Story />
            </PaginationProvider>
        )
    ],
    args: {
        itemName: "Item"
    }
};

export default meta;
type Story = StoryObj<typeof PaginationFooter>;

/** The default view of the `PaginationFooter`. */
export const Default: Story = {};

/** The small view of the `PaginationFooter`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
