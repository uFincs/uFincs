import classNames from "classnames";
import * as React from "react";
import {Checkbox} from "components/atoms";
import {useSelectableList} from "hooks/";
import {Id} from "utils/types";
import "./SelectableListCheckbox.scss";

interface SelectableListCheckboxProps {
    /** Custom class name. */
    className?: string;

    /** Custom class name for the container */
    containerClassName?: string;

    /** The list of items that is selectable. Needed so that we can know how many items are
     *  selected of the total list.
     *
     *  The items need to have an `id` property so that can we select them all when the checkbox is
     *  checked.*/
    items: Array<{id: Id}>;
}

/** A checkbox that is tied into the `useSelectableList` context hook.
 *
 *  By tying the checkbox into the hook, the checkbox can control the selected state for an entire list. */
const SelectableListCheckbox = ({
    className,
    containerClassName,
    items = [],
    ...otherProps
}: SelectableListCheckboxProps) => {
    const totalItems = items.length;
    const {state: selectableState, dispatch} = useSelectableList();

    const selectedItems = Object.keys(selectableState);

    const allSelected = selectedItems.length === totalItems;
    const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

    return (
        <Checkbox
            className={classNames("SelectableListCheckbox", className)}
            containerClassName={containerClassName}
            label="Select all"
            checked={allSelected}
            partiallyChecked={someSelected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                    const ids = items.map(({id}) => id);
                    dispatch.selectItems(ids);
                } else {
                    dispatch.unselectAllItems();
                }
            }}
            {...otherProps}
        />
    );
};

export default SelectableListCheckbox;
