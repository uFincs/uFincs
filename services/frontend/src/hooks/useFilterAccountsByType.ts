import {useMemo} from "react";
import {AccountData, AccountType} from "models/";
import {useAccountTypes} from "./useAccountTypes";

/** Filter the given set of transactions using the transaction type Context state. */
const useFilterAccountsByType = (
    accountsByType: Record<AccountType, Array<AccountData>>
): Record<AccountType, Array<AccountData>> => {
    // Disable error checking for the Account Types Provider so that we can just pass through
    // the accounts unfiltered when type filtering isn't used.
    const {state} = useAccountTypes({disableErrorCheck: true});

    return useMemo(() => {
        if (state === undefined) {
            return accountsByType;
        } else {
            return (Object.keys(accountsByType) as Array<AccountType>)
                .filter((type) => state[type])
                .reduce((acc, type) => {
                    acc[type] = accountsByType[type];
                    return acc;
                }, {} as Record<AccountType, Array<AccountData>>);
        }
    }, [accountsByType, state]);
};

export default useFilterAccountsByType;
