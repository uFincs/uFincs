import type {Meta} from "@storybook/react";
import {useState} from "react";
import * as React from "react";
import {useForm, Controller} from "react-hook-form";
import {storyUsingHooks} from "utils/stories";
import CustomFormatDateInput from "./CustomFormatDateInput";

const meta: Meta<typeof CustomFormatDateInput> = {
    title: "Molecules/Custom Format Date Input",
    component: CustomFormatDateInput
};

export default meta;

/** An example of how to use the `CustomFormatDateInput` uncontrolled (i.e. react-hook-form). */
export const Uncontrolled = storyUsingHooks(() => {
    const {control} = useForm();

    return (
        <Controller
            control={control}
            defaultValue="2020-04-01"
            name="date"
            render={({value, onChange}) => (
                <CustomFormatDateInput
                    aria-label="Custom Date Input"
                    value={value}
                    onChange={onChange}
                />
            )}
        />
    );
});

/** An example of how to use the `CustomFormatDateInput` controlled. */
export const Controlled = storyUsingHooks(() => {
    const [value, setValue] = useState("2020-04-01");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

    return (
        <CustomFormatDateInput aria-label="Custom Date Input" value={value} onChange={onChange} />
    );
});
