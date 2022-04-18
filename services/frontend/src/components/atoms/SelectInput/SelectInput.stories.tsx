import {boolean} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import SelectInput from "./SelectInput";

export default {
    title: "Atoms/Select Input",
    component: SelectInput
};

const values = [
    {label: "Daily", value: "daily"},
    {label: "Weekly", value: "weekly"},
    {label: "Monthly", value: "monthly"},
    {label: "Yearly", value: "yearly"},
    {label: "All Time", value: "allTime"},
    {label: "Custom", value: "custom"}
];

const valuesWithEmpty = [{label: "", value: ""}, ...values];

/** An example of how to use the `SelectInput` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled = () => {
    const {register} = useForm();

    return (
        <SelectInput
            name="uncontrolled"
            title="Date Range"
            defaultValue="daily"
            values={values}
            ref={register()}
        />
    );
};

/** An example of how to use the `SelectInput` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState(values[0].value);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return <SelectInput title="Date Range" value={value} values={values} onChange={onChange} />;
};

/** An example of the `SelectInput` with a placeholder and empty first option. */
export const Placeholder = () => {
    const [value, setValue] = useState(valuesWithEmpty[0].value);
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value);

    return (
        <SelectInput
            placeholder="Select a thing"
            title="Date Range"
            value={value}
            values={valuesWithEmpty}
            onChange={onChange}
        />
    );
};

/** What the `SelectInput`'s error state looks like. */
export const Error = () => (
    <SelectInput defaultValue="daily" values={values} error={boolean("Error", true)} />
);

/** What the `SelectInput`'s success state looks like. */
export const Success = () => (
    <SelectInput
        defaultValue="daily"
        values={values}
        hasStatusState={true}
        showSuccess={boolean("Success", true)}
    />
);

/** What the `SelectInput` looks like when it's disabled. */
export const Disabled = () => (
    <SelectInput title="Date Range" defaultValue="daily" disabled={true} values={values} />
);

/** A `SelectInput` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <SelectInput
        containerClassName="Element--story-FocusOutline"
        title="Date Range"
        defaultValue="daily"
        values={values}
    />
);
