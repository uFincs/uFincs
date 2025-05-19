import classNames from "classnames";
import {useMemo, useState} from "react";
import {Input, ListItemCheckbox} from "components/atoms";
import {useCurrencySymbol} from "hooks/";
import {Account, AccountType, BulkEditableAccountProperty} from "models/";
import {ValueFormatting} from "services/";
import debounce from "utils/debounce";
import {Cents, Id} from "utils/types";
import "./SelectableAccountsListItem.scss";

interface SelectableAccountsListItemProps {
    /** Custom class name. */
    className?: string;

    /** The ID of the account. */
    id: Id;

    /** The initial name of the account. */
    initialName?: string;

    /** The initial opening balance of the account. */
    initialOpeningBalance?: Cents;

    /** Whether or not the account is currently selected. */
    selected: boolean;

    /** Any style props to pass through (e.g. for animation). */
    style?: any;

    /** The type of the account. Controls whether or not to show the opening balance input. */
    type: AccountType;

    /** Handler for when the account becomes selected/deselected. */
    onSelect: (selected: boolean) => void;

    /** Handler for when one of the account values (name/opening balance) changes. */
    onValueChange: (id: Id, property: BulkEditableAccountProperty, value: string) => void;
}

/** An accounts list item that is selectable.
 *  Used during the onboarding process to allow users to select accounts. */
const SelectableAccountsListItem = ({
    className,
    id,
    initialName = "",
    initialOpeningBalance = 0,
    selected = false,
    style,
    type,
    onSelect,
    onValueChange
}: SelectableAccountsListItemProps) => {
    const [name, setName] = useState(initialName);

    const currencySymbol = useCurrencySymbol();

    const [openingBalance, setOpeningBalance] = useState(
        ValueFormatting.formatMoney(initialOpeningBalance, {
            currencySymbol,
            withoutDollarSign: true
        })
    );

    const onNameChange = useMemo(
        () => debounce((name) => onValueChange(id, "name", name)),
        [id, onValueChange]
    );

    const onOpeningBalanceChange = useMemo(
        () => debounce((balance) => onValueChange(id, "openingBalance", balance)),
        [id, onValueChange]
    );

    const noBalance = !Account.hasOpeningBalanceAndInterest(type);

    return (
        <div
            className={classNames(
                "SelectableAccountsListItem",
                {
                    "SelectableAccountsListItem--selected": selected,
                    "SelectableAccountsListItem--no-balance": noBalance
                },
                className
            )}
            data-testid="selectable-accounts-list-item"
            style={style}
        >
            <ListItemCheckbox
                data-testid="selectable-accounts-list-item-checkbox"
                aria-label="Select Account"
                checked={selected}
                onCheck={onSelect}
            />

            <Input
                data-testid="selectable-accounts-list-item-name"
                aria-label="Name"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    onNameChange(e.target.value);
                }}
            />

            {!noBalance ? (
                <Input
                    data-testid="selectable-accounts-list-item-balance"
                    aria-label="Opening Balance"
                    placeholder="3.50"
                    type="number"
                    min="0.00"
                    step="0.01"
                    prefix={currencySymbol}
                    value={openingBalance}
                    onChange={(e) => {
                        setOpeningBalance(e.target.value);
                        onOpeningBalanceChange(e.target.value);
                    }}
                />
            ) : null}
        </div>
    );
};

export default SelectableAccountsListItem;
