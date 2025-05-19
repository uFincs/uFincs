import type {Meta, StoryObj} from "@storybook/react";
import SettingsListItem from "./SettingsListItem";

const meta: Meta<typeof SettingsListItem> = {
    title: "Molecules/Settings List Item",
    component: SettingsListItem,
    args: {
        desktopLayout: false,
        description: "Change your email and password",
        title: "User Account",
        active: true,
        icon: undefined
    }
};

export default meta;
type Story = StoryObj<typeof SettingsListItem>;

/** What the desktop version of the `SettingsListItem` looks like. */
export const Desktop: Story = {
    args: {
        desktopLayout: true
    }
};

/** What the mobile version of the `SettingsListItem` looks like. */
export const Mobile: Story = {};

/** The `SettingsListItem` with a custom icon. */
export const CustomIcon: Story = {
    args: {
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* eslint-disable-next-line max-len */}
                <path d="M19 14c-2.45 0-4.67 1.03-6.22 2.58a3.49 3.49 0 0 0-1.25.86c-.73.4-1.49.67-2.25.8v.03c.71.14 1.41.25 2.12.33 1.07.12 2.14.18 3.2.19 2.07.02 3.96-1.45 4.3-3.47a2.86 2.86 0 0 0-.59-1.74z"></path>
                <path d="M23 11v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v12a4 4 0 0 0 4 4h6"></path>
            </svg>
        ),
        desktopLayout: false
    }
};
