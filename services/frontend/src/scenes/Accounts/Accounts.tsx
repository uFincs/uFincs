import classNames from "classnames";
import React from "react";
import {Route, Switch} from "react-router";
import {RouteComponentProps} from "react-router-dom";
import {DelayedRender} from "components/atoms";
import {
    AccountTypeFilters,
    AccountsList,
    EmptyAccountsList,
    SceneHeaderWithDateRangePicker
} from "components/organisms";
import {useFilterAccountsByType, useWindowWidthBreakpoint, AccountTypesProvider} from "hooks/";
import {AccountData, AccountType} from "models/";
import {AccountDetails} from "scenes/";
import {accountDetailsDoubleColumnMatches} from "utils/mediaQueries";
import {Id} from "utils/types";
import {DerivedAppScreenUrls} from "values/screenUrls";
import connect, {ConnectedProps} from "./connect";
import {useRedirectToDetails} from "./hooks";
import "./Accounts.scss";

interface AccountsProps extends Partial<RouteComponentProps<{id: Id}>>, ConnectedProps {
    /** The first account. Used on desktop when switching to the Accounts page to determine
     *  which account to show. */
    firstAccount?: AccountData;
}

/** The Accounts scene. Pulls double duty for displaying the Accounts List and Account Details.
 *
 *  Although both are only shown on desktop, they get separate routes on mobile. */
const PureAccounts = React.memo(
    ({accountsByType, firstAccount, match, onAddAccount}: AccountsProps) => {
        useRedirectToDetails(firstAccount);

        const doubleColumnLayout = useWindowWidthBreakpoint(accountDetailsDoubleColumnMatches);
        const id = match?.params?.id;

        return (
            <main className="Accounts">
                {/* On desktop, we always want to show the scene header. */}
                {doubleColumnLayout && (
                    <SceneHeaderWithDateRangePicker
                        className={classNames("Accounts-header", "Accounts-header-desktop")}
                        title="Accounts"
                    />
                )}

                {/* On mobile, we only want to show the scene header on the list view. */}
                {!doubleColumnLayout && (
                    <Route path={DerivedAppScreenUrls.ACCOUNTS} exact={true}>
                        <SceneHeaderWithDateRangePicker
                            className={classNames("Accounts-header", "Accounts-header-mobile")}
                            title="Accounts"
                        />
                    </Route>
                )}

                <div className="Accounts-body">
                    {doubleColumnLayout &&
                        (!firstAccount && !id ? (
                            <EmptyAccountsList
                                className="Accounts-EmptyAccountsList"
                                onClick={onAddAccount}
                            />
                        ) : (
                            <div className="Accounts-list-container-desktop">
                                <AccountTypeFilters className="Accounts-AccountTypeFilters" />

                                <DelayedRender>
                                    <AccountsList
                                        className="Accounts-desktop-list"
                                        data-testid="accounts-list-desktop"
                                        accountsByType={accountsByType}
                                        singleLayer={true}
                                    />
                                </DelayedRender>
                            </div>
                        ))}

                    <Switch>
                        <Route path={DerivedAppScreenUrls.ACCOUNT_DETAILS}>
                            <AccountDetails id={id} />
                        </Route>

                        {!doubleColumnLayout && (
                            <Route path={DerivedAppScreenUrls.ACCOUNTS} exact={true}>
                                <div className="Accounts-list-container-mobile">
                                    <AccountTypeFilters className="Accounts-AccountTypeFilters" />

                                    <DelayedRender>
                                        <AccountsList
                                            className="Accounts-mobile-list"
                                            data-testid="accounts-list-mobile"
                                            accountsByType={accountsByType}
                                            singleLayer={false}
                                        />
                                    </DelayedRender>
                                </div>
                            </Route>
                        )}
                    </Switch>
                </div>
            </main>
        );
    }
);

const Accounts = ({accountsByType, ...otherProps}: ConnectedProps) => {
    accountsByType = useFilterAccountsByType(accountsByType);

    const types = Object.keys(accountsByType) as Array<AccountType>;
    const firstAccount = getFirstAccount(accountsByType, types);

    return (
        <PureAccounts accountsByType={accountsByType} firstAccount={firstAccount} {...otherProps} />
    );
};

const WrappedAccounts = (props: ConnectedProps) => (
    <AccountTypesProvider>
        <Accounts {...props} />
    </AccountTypesProvider>
);

export default connect(WrappedAccounts);

/* Helper Functions */

const getFirstAccount = (
    accountsByType: Record<AccountType, Array<AccountData>>,
    types: Array<AccountType>
) => {
    for (const type of types) {
        if (accountsByType[type].length > 0) {
            return accountsByType[type]?.[0];
        }
    }

    return undefined;
};
