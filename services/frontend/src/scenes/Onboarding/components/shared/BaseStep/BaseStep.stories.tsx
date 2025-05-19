import type {Meta, StoryObj} from "@storybook/react";
import {TextField} from "components/atoms";
import {Account} from "models/";
import BaseStep from "./BaseStep";

const meta: Meta<typeof BaseStep> = {
    title: "Scenes/Onboarding/Shared/Base Step",
    component: BaseStep,
    args: {
        type: Account.ASSET,
        children: (
            <TextField>
                Assets are your <strong>resources</strong>.
                <br /> <br />
                These are things like the <strong>Chequing</strong> account at your bank or the cash
                you have on hand.
            </TextField>
        )
    }
};

export default meta;
type Story = StoryObj<typeof BaseStep>;

/** The default view of `CustomizeAssetsStep`. */
export const Default: Story = {};
