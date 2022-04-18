import React, {useState} from "react";
import {useForm, Controller} from "react-hook-form";
import CustomFormatDateInput from "./CustomFormatDateInput";

export default {
    title: "Molecules/Custom Format Date Input",
    component: CustomFormatDateInput
};

/** An example of how to use the `CustomFormatDateInput` uncontrolled (i.e. react-hook-form). */
export const Uncontrolled = () => {
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
};

/** An example of how to use the `CustomFormatDateInput` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState("2020-04-01");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);

    return (
        <CustomFormatDateInput aria-label="Custom Date Input" value={value} onChange={onChange} />
    );
};
