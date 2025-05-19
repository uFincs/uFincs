import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import {PureComponent as ActiveImportRules} from "./ActiveImportRules";

const meta: Meta<typeof ActiveImportRules> = {
    title: "Organisms/Active Import Rules",
    component: ActiveImportRules,
    args: {
        areRulesEnabled: true
    }
};

export default meta;
type Story = StoryObj<typeof ActiveImportRules>;

/** The default view of `ActiveImportRules`. */
export const Default: Story = {};

/** The small view of `ActiveImportRules`. */
export const Small: Story = {
    args: {
        areRulesEnabled: true
    }
};

Small.parameters = smallViewport;

/** The empty view of `ActiveImportRules`. */
export const Empty: Story = {};
