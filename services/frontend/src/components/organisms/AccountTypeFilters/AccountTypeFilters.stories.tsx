import React from "react";
import {AccountTypesProvider, DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import AccountTypeFilters from "./AccountTypeFilters";

export default {
    title: "Organisms/Account Type Filters",
    component: AccountTypeFilters
};

const WrappedAccountTypeFilters = (props: any) => (
    <DateRangeProvider>
        <AccountTypesProvider>
            <AccountTypeFilters {...props} />
        </AccountTypesProvider>
    </DateRangeProvider>
);

/** The default view of the `AccountTypeFilters`. */
export const Default = () => <WrappedAccountTypeFilters />;

/** The small view of the `AccountTypeFilters`. */
export const Small = () => <WrappedAccountTypeFilters style={{width: "100%"}} />;

Small.parameters = smallViewport;
