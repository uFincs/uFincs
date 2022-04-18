import React from "react";
import {SelectableListProvider} from "hooks/";
import SelectableListCheckbox from "./SelectableListCheckbox";

export default {
    title: "Molecules/Selectable List Checkbox",
    component: SelectableListCheckbox
};

const items = [{id: "1"}, {id: "2"}, {id: "3"}];

/** The default view of `SelectableListCheckbox`. */
export const Default = () => (
    <SelectableListProvider>
        <SelectableListCheckbox items={items} />
    </SelectableListProvider>
);
