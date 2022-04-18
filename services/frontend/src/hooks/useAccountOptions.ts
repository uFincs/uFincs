import {useMemo} from "react";
import {Account, AccountData} from "models/";
import {AccountOption, AccountType} from "models/Account";

/** Converts a map of accounts into 'options' that can be used with e.g. an AutocompleteInput. */
const useAccountOptions = (
    accountTypes: Array<AccountType>,
    accountsByType: Record<AccountType, Array<AccountData>>
): Array<AccountOption> =>
    useMemo(
        () => Account.generateAccountOptions(accountTypes, accountsByType),
        [accountTypes, accountsByType]
    );

export default useAccountOptions;
