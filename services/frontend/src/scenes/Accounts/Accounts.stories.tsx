import type {Meta} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {
    smallViewport,
    smallLandscapeViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts
} from "utils/stories";
import Accounts from "./Accounts";

// Tech Debt: These stories don't work for some reason.

const meta: Meta<typeof Accounts> = {
    title: "Scenes/Accounts",
    component: Accounts
};

export default meta;

const WrappedAccounts = () => (
    <DateRangeProvider>
        <Accounts />
    </DateRangeProvider>
);

const useMakeFunctional = () => {
    useCreateAccounts(storyData.accounts);
};

// Note: These stories don't really work well because this is (so far) the only scene where
// routes are used inside the scene to determine what renders. As such, since stories don't use
// the app routes, the scene doesn't render correctly.

/** The large (desktop) view of the `Accounts` scene. */
export const Large = storyUsingRedux(() => {
    useMakeFunctional();
    return <WrappedAccounts />;
});

/** The small (mobile) view of the `Accounts` scene. */
export const Small = storyUsingRedux(() => {
    useMakeFunctional();
    return <WrappedAccounts />;
});

Small.parameters = smallViewport;

/** The small landscape view of the `Accounts` scene. */
export const SmallLandscape = storyUsingRedux(() => {
    useMakeFunctional();
    return <WrappedAccounts />;
});

SmallLandscape.parameters = smallLandscapeViewport;

/** The empty view of the `Accounts` scene. */
export const Empty = storyUsingRedux(() => <WrappedAccounts />);

/** The small empty view of the `Accounts` scene. */
export const EmptySmall = storyUsingRedux(() => <WrappedAccounts />);

EmptySmall.parameters = smallViewport;
