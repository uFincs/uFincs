import classNames from "classnames";
import React, {useCallback, useMemo} from "react";
import {ChevronDownIcon} from "assets/icons";
import {LabelledInput} from "components/molecules";
import {LabelledInputProps} from "components/molecules/LabelledInput";
import {SearchService} from "services/";
import {SuggestionOption, SuggestionOptionLabel} from "utils/types";
import {
    useAutofillSingleValue,
    useDownshift,
    useFilterSuggestions,
    useInputKeyDown,
    useValueOption
} from "./hooks";
import "./AutocompleteInput.scss";

interface AutocompleteInputProps extends LabelledInputProps {
    /** Whether or not to autofill the input when there exists only a single suggestion.
     *  Turned on by default. */
    autofillSingleValue?: boolean;

    /** Whether or not to enable filtering so that the list of suggestions is filtered
     *  as the user types. This makes the input act as an actual combobox. */
    enableFiltering?: boolean;

    /** Whether or not to show the 'down chevron' icon on the right of the input
     *  that toggles open/close the autocomplete suggestions. */
    showToggleButton?: boolean;

    /** The set of suggestions to display in the dropdown as autocomplete options. */
    suggestions: Array<SuggestionOption>;

    /** We're re-declaring `value` here so that it only accepts strings;
     *  not numbers or string arrays like a regular input. */
    value: SuggestionOptionLabel;

    /** Handler for when the input value changes.
     *
     *  When an option hasn't been found/selected, the label/value of the option will be the same.
     *  When an option _has_ been found/selected, the label/value will be that of the selected option.
     *
     *  In this way, the consumer can distinguish between normal input value changes and when an
     *  option has been selected. Of course, this relies on the suggestions having different values
     *  for the label/value pairs. Otherwise, this all goes out the window. */
    onInputValueChange: (option: SuggestionOption) => void;
}

/** An input that acts as a typeahead where the user gets shown suggestions based on what
 *  they've typed that they can then use to autocomplete what they're typing. */
const AutocompleteInput = React.forwardRef(
    (
        {
            className,
            containerClassName,
            autofillSingleValue = true,
            showToggleButton = false,
            enableFiltering = false,
            value,
            suggestions = [],
            onInputValueChange,
            onKeyDown,
            ...otherProps
        }: AutocompleteInputProps,
        ref: React.Ref<HTMLInputElement>
    ) => {
        const valueOption = useValueOption(value);
        suggestions = useFilterSuggestions(enableFiltering, value, suggestions);

        useAutofillSingleValue(autofillSingleValue, value, suggestions, onInputValueChange);

        const {
            isOpen,
            selectedItem,
            highlightedIndex,
            closeMenu,
            openMenu,
            getComboboxProps,
            getItemProps,
            getInputProps,
            getLabelProps,
            getMenuProps,
            getToggleButtonProps
        } = useDownshift(valueOption, suggestions, onInputValueChange);

        const inputOnKeyDown = useInputKeyDown({
            suggestions,
            isOpen,
            highlightedIndex,
            closeMenu,
            onInputValueChange,
            onKeyDown
        });

        const openSuggestionsOnFocus = useCallback(() => {
            if (!isOpen) {
                openMenu();
            }
        }, [isOpen, openMenu]);

        return (
            <div
                {...getComboboxProps({
                    className: classNames("AutocompleteInput-container", containerClassName)
                })}
            >
                <LabelledInput
                    type="text"
                    {...getInputProps({
                        ...otherProps,
                        ref,
                        className: classNames("AutocompleteInput", className),
                        onKeyDown: inputOnKeyDown,
                        onFocus: openSuggestionsOnFocus,
                        onClick: openSuggestionsOnFocus
                    })}
                    labelProps={getLabelProps()}
                    RightIcon={showToggleButton && ChevronDownIcon}
                    rightIconButtonProps={
                        showToggleButton && getToggleButtonProps({title: "Open Suggestions"})
                    }
                />

                <AutocompleteSuggestions
                    isOpen={isOpen}
                    value={selectedItem}
                    suggestions={suggestions}
                    highlightedIndex={highlightedIndex}
                    getMenuProps={getMenuProps}
                    getItemProps={getItemProps}
                />
            </div>
        );
    }
);

interface AutocompleteSuggestionsProps {
    /** Whether or not the suggestions are open. */
    isOpen: boolean;

    /** The current value of the input (not necessarily a selected option). */
    value: SuggestionOption;

    /** The set of suggestions to be displayed for the user to autocomplete from. */
    suggestions: Array<SuggestionOption>;

    /** Which option is currently focused by the user through keyboard navigation. */
    highlightedIndex: number;

    /** Function from Downshift. */
    getItemProps: (options: any) => any;

    /** Function from Downshift. */
    getMenuProps: (options: any) => any;
}

/** The set of autocomplete suggestions to display. */
const AutocompleteSuggestions = ({
    isOpen = false,
    value,
    suggestions = [],
    highlightedIndex,
    getItemProps,
    getMenuProps
}: AutocompleteSuggestionsProps) => {
    const options = useMemo(
        () =>
            suggestions.map((item, index) => (
                <li
                    {...getItemProps({
                        className: classNames(
                            "AutocompleteInput-suggestion",
                            {
                                "AutocompleteInput-suggestion--highlighted":
                                    highlightedIndex === index
                            },
                            {
                                "AutocompleteInput-suggestion--active": SearchService.stringsEqual(
                                    value.label,
                                    item.label
                                )
                            }
                        ),
                        index,
                        item,
                        title: item.label
                    })}
                    key={item.value}
                >
                    <span className="AutocompleteInput-suggestion-text">{item.label}</span>
                </li>
            )),
        [highlightedIndex, value, suggestions, getItemProps]
    );

    return (
        <ul {...getMenuProps({className: "AutocompleteInput-suggestions"})}>
            {isOpen ? options : null}
        </ul>
    );
};

export default AutocompleteInput;
