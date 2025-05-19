import {Meta, StoryObj} from "@storybook/react";
import {SelectableListProvider} from "hooks/";
import {Account} from "models/";
import SelectableAccountsListItem from "./SelectableAccountsListItem";

const meta: Meta<typeof SelectableAccountsListItem> = {
    title: "Molecules/Selectable Accounts List Item",
    component: SelectableAccountsListItem,
    decorators: [
        (Story) => (
            <SelectableListProvider>
                <Story />
            </SelectableListProvider>
        )
    ],
    args: {
        id: "123",
        initialName: "Chequing Account",
        initialOpeningBalance: 0,
        selected: false,
        type: Account.ASSET
    }
};

export default meta;
type Story = StoryObj<typeof SelectableAccountsListItem>;

/** The default view of `SelectableAccountsListItem`. */
export const Default: Story = {};
