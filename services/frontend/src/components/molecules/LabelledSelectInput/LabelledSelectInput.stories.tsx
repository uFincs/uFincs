import type {Meta} from "@storybook/react";
import {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import {mappableFieldOptions} from "values/importProfileFields";
import LabelledSelectInput from "./LabelledSelectInput";

const meta: Meta<typeof LabelledSelectInput> = {
    title: "Molecules/Labelled Select Input",
    component: LabelledSelectInput
};

export default meta;

/** An example of how to use the `LabelledSelectInput` uncontrolled. */
export const Uncontrolled = storyUsingHooks(() => {
    const {control} = useForm();

    return (
        <Controller
            name="controlled"
            control={control}
            defaultValue=""
            render={({value, onChange}) => (
                <LabelledSelectInput
                    name="uncontrolled"
                    label="Field"
                    defaultValue={mappableFieldOptions[0].value}
                    value={value}
                    values={mappableFieldOptions}
                    onChange={onChange}
                />
            )}
        />
    );
});

/** An example of how to use the `LabelledSelectInput` controlled. */
export const Controlled = storyUsingHooks(() => {
    const [value, setValue] = useState(mappableFieldOptions[0].value as string);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return (
        <LabelledSelectInput
            label="Field"
            value={value}
            values={mappableFieldOptions}
            onChange={onChange}
        />
    );
});

/** What the `LabelledSelectInput`'s error state looks like. */
export const Error = storyUsingHooks(() => {
    const [value, setValue] = useState(mappableFieldOptions[0].value as string);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return (
        <LabelledSelectInput
            label="Field"
            value={value}
            values={mappableFieldOptions}
            onChange={onChange}
            hasStatusState={true}
            error="You dun goofed"
        />
    );
});
