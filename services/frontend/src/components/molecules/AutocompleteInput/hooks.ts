import {useCombobox} from "downshift";
import {useCallback, useEffect, useMemo} from "react";
import {SearchService} from "services/";
import {SuggestionOption, SuggestionOptionLabel} from "utils/types";
import KeyCodes from "values/keyCodes";

/** Hook for the primary logic of the autocomplete input from the Downshift package. */
export const useDownshift = (
    valueOption: SuggestionOption,
    suggestions: Array<SuggestionOption>,
    onInputValueChange: (option: SuggestionOption) => void
) => {
    return useCombobox<SuggestionOption>({
        selectedItem: valueOption,
        items: suggestions,
        itemToString: (item) => (item ? (item.label as string) : ""),
        onInputValueChange: ({inputValue, selectedItem}) => {
            let changeValue = selectedItem;

            // When the selectedItem's values are the same, that means that no value
            // has actually been selected (short of the label and value of the suggestion
            // being _actually_ the same, which is the consumer's fault).
            //
            // When this is the case, we want to pass back an 'option' that just contains
            // the input's value. We do this by stuffing the input value as the option's
            // label and value, like we do when converting the incoming prop `value` for use
            // by Downshift (i.e. see the `useValueOption` hook below).
            //
            // This way, the consumer of this component can have just 1 change handler that
            // can differentiate between 'selected' items and 'input values' by checking
            // if the value/label are the same.
            //
            // The _reason_ we're doing this (instead of just using the builtin `onOptionSelected`)
            // is because I ran into a case where having both `onInputValueChange` and
            // `onOptionSelected` would cause both to fire and `onInputValueChange` would override
            // `onOptionSelected`. As such, it became kinda pointless to have and got in the way.
            if (selectedItem?.label === selectedItem?.value) {
                // Casting to string to drop the undefined.
                changeValue = {label: inputValue as string, value: inputValue as string};
            }

            // OK, this is going to be hard to describe. Basically, there's an interesting (i.e. buggy)
            // race condition between the autofilling logic and the type clearing logic of the
            // `TransactionForm`. In effect, what happens is that changing types with the autofiller
            // turned on results in an infinite loop while the input switches back and before between
            // an empty value and the first suggestion.
            //
            // It seems to do this because this `onInputValueChange` seems to fire when I wouldn't think it
            // would -- right after autofilling the input. However, we can tell when this happens because
            // the `valueOption` and the `changeValue` are the same. As such, we check if they are to
            // make sure the change handler doesn't fire.
            //
            // This is a good check to have _anyways_, because trying to change the value to what
            // it's _already_ set to is a no-op.
            if (
                changeValue?.label === valueOption.label &&
                changeValue?.value === valueOption.value
            ) {
                return;
            }

            if (changeValue?.label === changeValue?.value) {
                const matchingSuggestion = suggestions.filter(({label}) =>
                    SearchService.stringsEqual(changeValue?.label as string, label)
                );

                if (matchingSuggestion.length > 0) {
                    changeValue = matchingSuggestion[0];
                }
            }

            // Note that onInputValueChange change fires at the same time as onOptionSelected
            // does. Since we're passing the selectedItem along regardless, there's no
            // point in having both handlers.
            //
            // Need to cast it to drop the 'undefined'. We know the value will exist.
            onInputValueChange?.(changeValue as SuggestionOption);
        }
    });
};

/** Hook for optionally autofilling the input when there is only one suggestion. */
export const useAutofillSingleValue = (
    autofillSingleValue: boolean,
    value: SuggestionOptionLabel,
    suggestions: Array<SuggestionOption>,
    onInputValueChange?: (option: SuggestionOption) => void
) => {
    useEffect(() => {
        if (autofillSingleValue && !value && suggestions.length === 1) {
            onInputValueChange?.(suggestions[0]);
        }
    }, [autofillSingleValue, value, suggestions, onInputValueChange]);
};

/** Hook for optionally filtering the suggestions as the user types. */
export const useFilterSuggestions = (
    enableFiltering: boolean,
    value: SuggestionOptionLabel,
    suggestions: Array<SuggestionOption>
) =>
    useMemo(() => {
        if (enableFiltering) {
            // This is a very naive form of filtering (just exact match), but it's good
            // enough for this use case.
            const filtered = suggestions.filter(({label}) =>
                SearchService.stringIncludesQuery(label, value)
            );

            const exactMatch = !!suggestions.find(({label}) =>
                SearchService.stringsEqual(label, value)
            );

            // When the only suggestion left matches the user's input (i.e. they have selected an option),
            // then we want to show the full set of suggestions. This is so that the user can click
            // into the input to easily change options if they want.
            // Otherwise, they would have to clear the input's value before changing options.
            return exactMatch ? suggestions : filtered;
        } else {
            return suggestions;
        }
    }, [enableFiltering, value, suggestions]);

/** Hook for converting the prop value into a SuggestionOption so that Downshift can use it. */
export const useValueOption = (value: SuggestionOptionLabel): SuggestionOption =>
    // Need to memoize the value for use with `selectedItem`, since it uses reference equality.
    //
    // And the value needs to be an object because `selectedItem` expects a value that matches
    // `suggestions`, in this case `SuggestionOption`. However, for `selectedItem`s purpose, only
    // the label matters, hence why we just chuck the value in as the `value` property to satisfy
    // the `SuggestionOption` interface.
    //
    // Finally, note that using the prop 'value' (which is really 'label') as the option 'value'
    // means that the `AutocompleteSuggestions` component only has access to the
    // 'label' as the current 'value'. Yeah, it's confusing.
    //
    // We _could_ assume labels are unique and then lookup the actual 'value' in `suggestions`,
    // but that doesn't really get us anything, and it is an (albeit minor) performance hit.
    //
    // Ultimately, all that matters is that `onOptionSelected` receives a `SuggestionOption`, which
    // it will from `onSelectedItemChange`.
    useMemo(
        () => ({
            label: value,
            value
        }),
        [value]
    );

/** Hook for modifying the onKeyDown of the input so that hitting 'Enter' without anything
 *  selected gets the first suggestion selected. */
export const useInputKeyDown = ({
    suggestions,
    isOpen,
    highlightedIndex,
    closeMenu,
    onInputValueChange,
    onKeyDown
}: {
    suggestions: Array<SuggestionOption>;
    isOpen: boolean;
    highlightedIndex: number;
    closeMenu: () => void;
    onInputValueChange?: (option: SuggestionOption) => void;
    onKeyDown: ((e: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
}) =>
    useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (
                isOpen &&
                e.keyCode === KeyCodes.ENTER &&
                highlightedIndex === -1 &&
                suggestions.length > 0
            ) {
                // This is to prevent things like an input in a form submitting the form
                // when Enter is hit. We _do_ want that functionality, just after the
                // user selects an item.
                //
                // So the flow is: user starts typing, hits Enter to select first option
                // implicitly, then hits Enter again to submit the form.
                e.preventDefault();

                // Take the first option when the user has typed text but not
                // moved into the options list yet.
                //
                // Note: We _need_ to use the onInputValueChange that is passed as a prop to
                // AutocompleteInput, _not_ the `selectItem` callback from `useCombobox`.
                //
                // Because we are controlling the `selectedItem`, we have to update the parent's
                // view of `selectedItem`, and _not_ the internal state of `useCombobox`.
                //
                // As such, `selectItem` is actually useless for us and shouldn't ever be used.
                onInputValueChange?.(suggestions[0]);

                closeMenu();
            } else if (!isOpen) {
                // Only allow the passed-in onKeyPress to fire when the options
                // are closed; obviously, Downshift needs control over key presses
                // when the options are open for navigation/selection.
                onKeyDown?.(e);
            }
        },
        [suggestions, isOpen, highlightedIndex, closeMenu, onInputValueChange, onKeyDown]
    );
