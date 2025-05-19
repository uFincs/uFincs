import type {Meta, StoryObj} from "@storybook/react";
import WarningMessage from "./WarningMessage";

const meta: Meta<typeof WarningMessage> = {
    title: "Molecules/Warning Message",
    component: WarningMessage
};

export default meta;
type Story = StoryObj<typeof WarningMessage>;

/** The default view of `WarningMessage`. */
export const Default: Story = {
    args: {
        children: (
            <>
                <strong>Looks like we found 3 duplicate transactions.</strong>
                <br /> <br />
                They have been <strong>automatically excluded</strong> from being imported.
                <br /> <br />
                If you want to <strong>include</strong> any of them, just select the transactions
                and choose the <strong>&quot;Include in Import&quot;</strong> action.
            </>
        )
    }
};
