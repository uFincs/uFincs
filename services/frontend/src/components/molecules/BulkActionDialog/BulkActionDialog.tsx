import classNames from "classnames";
import React, {useCallback, useMemo, useState} from "react";
import {Button, LinkButton} from "components/atoms";
import {AutocompleteSelectInput, LabelledInput, TransactionTypePicker} from "components/molecules";
import {useCurrencySymbol, useOutsideCloseable} from "hooks/";
import {Transaction} from "models/";
import {DateService} from "services/";
import {SuggestionOption} from "utils/types";
import KeyCodes from "values/keyCodes";
import "./BulkActionDialog.scss";

interface BulkActionDialogProps {
    /** Custom class name. */
    className?: string;

    /** The type of input to display. */
    inputType?: "date" | "money" | "select" | "text" | "transactionType";

    /** The label of what this bulk dialog modifies.  */
    label: string;

    /** The set of suggestions used when the `inputType === "select"`. */
    suggestions?: Array<SuggestionOption>;

    /** Handler for closing the dialog. */
    onClose: () => void;

    /** Handler for submitting the changes from the dialog. */
    onSubmit: (value: string) => void;
}

/** The dialog used with the bulk actions (e.g. `BulkTransactionActions`) for changing
 *  the specified property for several transactions. */
const BulkActionDialog = ({
    className,
    inputType = "text",
    label,
    suggestions = [],
    onClose,
    onSubmit,
    ...otherProps
}: BulkActionDialogProps) => {
    const currencySymbol = useCurrencySymbol();

    const {closeableContainerProps} = useOutsideCloseable<HTMLInputElement>(false, onClose);

    const [stringValue, setStringValue] = useState(
        inputType === "date" ? DateService.getTodayAsUTCString() : ""
    );

    const [typeValue, setTypeValue] = useState<string>(Transaction.INCOME);

    const onChangeString = (e: React.ChangeEvent<HTMLInputElement>) =>
        setStringValue(e.target.value);

    const onChangeClick = useCallback(() => {
        switch (inputType) {
            case "date":
                onSubmit(stringValue);
                break;
            case "money":
                onSubmit(stringValue);
                break;
            case "select":
                onSubmit(stringValue);
                break;
            case "transactionType":
                onSubmit(typeValue);
                break;
            case "text":
            // Falls through.
            default:
                onSubmit(stringValue);
                break;
        }

        onClose();
    }, [inputType, stringValue, typeValue, onClose, onSubmit]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<any>) => {
            if (e.keyCode === KeyCodes.ENTER) {
                e.preventDefault();
                onChangeClick();
            }
        },
        [onChangeClick]
    );

    const input = useMemo(() => {
        const labelProps = {placeholder: `Change the ${label}`, label};

        switch (inputType) {
            case "date":
                return (
                    <LabelledInput
                        containerClassName="BulkActionDialog-input-date"
                        type="date"
                        value={stringValue}
                        onChange={onChangeString}
                        onKeyDown={onKeyDown}
                        {...labelProps}
                    />
                );
            case "money":
                return (
                    <LabelledInput
                        label={label}
                        placeholder="3.50"
                        type="number"
                        min="0.00"
                        step="0.01"
                        prefix={currencySymbol}
                        value={stringValue}
                        onChange={onChangeString}
                        onKeyDown={onKeyDown}
                    />
                );
            case "select":
                return (
                    <AutocompleteSelectInput
                        currentValue={stringValue}
                        suggestions={suggestions}
                        onOptionSelected={setStringValue}
                        onKeyDown={onKeyDown}
                        {...labelProps}
                    />
                );
            case "transactionType":
                return (
                    <TransactionTypePicker
                        id="BulkActionDialog-type-picker"
                        value={typeValue}
                        onChange={setTypeValue}
                        onKeyDown={onKeyDown}
                        {...labelProps}
                    />
                );
            case "text":
            // Falls through.
            default:
                return (
                    <LabelledInput
                        value={stringValue}
                        onChange={onChangeString}
                        onKeyDown={onKeyDown}
                        {...labelProps}
                    />
                );
        }
    }, [currencySymbol, inputType, label, stringValue, suggestions, typeValue, onKeyDown]);

    return (
        <div
            className={classNames("BulkActionDialog", className)}
            ref={closeableContainerProps.ref}
            {...otherProps}
        >
            {input}

            <div className="BulkActionDialog-actions">
                <LinkButton className="BulkActionDialog-action-cancel" onClick={onClose}>
                    Cancel
                </LinkButton>

                <Button className="BulkActionDialog-action-change" onClick={onChangeClick}>
                    Change {label}
                </Button>
            </div>
        </div>
    );
};

export default BulkActionDialog;
