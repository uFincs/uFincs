import React, {useState} from "react";
import ListItemCheckbox from "./ListItemCheckbox";

export default {
    title: "Atoms/List Item Checkbox",
    component: ListItemCheckbox
};

/** The primary (default) variant view of `ListItemCheckbox`. */
export const PrimaryVariant = () => {
    const [checked, setChecked] = useState(false);

    return <ListItemCheckbox aria-label="Select" checked={checked} onCheck={setChecked} />;
};

/** The positive variant view of `ListItemCheckbox`. */
export const PositiveVariant = () => {
    const [checked, setChecked] = useState(false);

    return (
        <ListItemCheckbox
            aria-label="Select"
            checked={checked}
            variant="positive"
            onCheck={setChecked}
        />
    );
};
