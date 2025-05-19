import classNames from "classnames";
import {useCallback, useState} from "react";
import {AutocompleteInput} from "components/molecules";
import {LabelledInputProps} from "components/molecules/LabelledInput";
import {SuggestionOption, SuggestionOptionValue} from "utils/types";
import "./AutocompleteSelectInput.scss";

interface AutocompleteSelectInputProps extends Omit<LabelledInputProps, "value"> {
    /** The set of suggestions to display in the dropdown as autocomplete options. */
    suggestions: Array<SuggestionOption>;

    /** The current value (selected option).
     *
     *  Note that this is _not_ the raw value of the input; this is the `value` field from
     *  the selected option. This is different from `AutocompleteInput`, where the value prop
     *  _is_ the raw input value.
     *
     *  Note that this prop is _different_ from the normal value prop; the value prop is _not_ used here.
     *
     *  The `currentValue` is just used as an optimization so that `onOptionSelected` doesn't get called
     *  too much. As such, `AutocompleteSelectInput` acts much more like an uncontrolled input than
     *  a controlled one, because it can only pass values up; you cannot set the value of
     *  `AutocompleteSelectInput` from the consuming component.
     *
     *  A consequence of this is that you can't set a default value.
     *
     *  Why is it implemented like this? For simplicity's sake. We don't want to have to manage the
     *  raw value of the input at a higher level, so we internalize that state to `AutocompleteSelectInput`.
     *  As such, we lose out on a minor piece of functionality in exchange for an easier to use interface.
     *
     *  If you need to properly control the value of the input externally, use `AutocompleteInput`. */
    currentValue: SuggestionOptionValue;

    /** Handler for when an option gets selected or cleared. */
    onOptionSelected: (value: SuggestionOptionValue) => void;
}

/** A derivative of the `AutocompleteInput` that exposes only changes to the selected option,
 *  instead of the raw input value.
 *
 *  So... just like a regular `SelectInput`, except with autocomplete filtering.
 *
 *  Note that, as stated above, there is the (somewhat severe) limitation that this input can only be
 *  used in an 'uncontrolled' manor, in that the value cannot be specified externally.
 *
 *  If the value of the input (i.e. the selected option) needs to be controlled by e.g. the store,
 *  do _not_ use this input. Use a regular `SelectInput` instead. */
const AutocompleteSelectInput = ({
    className,
    label,
    currentValue,
    suggestions = [],
    onOptionSelected,
    ...otherProps
}: AutocompleteSelectInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const onInputValueChange = useCallback(
        (option: SuggestionOption) => {
            setInputValue(option.label);

            if (option.label === option.value) {
                // This is an optimization so that `onOptionSelected` doesn't get called
                // on every single input value change, but only when it should be cleared.
                if (currentValue !== "") {
                    // When the label/value are the same, this means no option was found
                    // and only the input value changed. Clear the store.
                    onOptionSelected("");
                }
            } else {
                // When the label/value are different, an option was found.
                onOptionSelected(option.value);
            }
        },
        [currentValue, onOptionSelected]
    );

    return (
        <AutocompleteInput
            containerClassName={classNames("AutocompleteSelectInput", className)}
            label={label}
            autofillSingleValue={true}
            enableFiltering={true}
            showToggleButton={true}
            suggestions={suggestions}
            value={inputValue}
            onInputValueChange={onInputValueChange}
            {...otherProps}
        />
    );
};

export default AutocompleteSelectInput;
