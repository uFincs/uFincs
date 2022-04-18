import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {ChevronDownIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import Input from "./Input";

export default {
    title: "Atoms/Input",
    component: Input
};

const placeholderKnob = () => text("Placeholder", "Enter your email");

/** An example of how to use the `Input` uncontrolled (e.g. with react-hook-form). */
export const Uncontrolled = () => {
    const {register} = useForm();

    return <Input name="uncontrolled" defaultValue={"test@test.com"} ref={register()} />;
};

/** An example of how to use the `Input` controlled. */
export const Controlled = () => {
    const [value, setValue] = useState("test@test.com");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    return <Input value={value} onChange={onChange} />;
};

/** What the `Input` looks like on small devices. */
export const Small = () => <Input placeholder={placeholderKnob()} />;

Small.parameters = smallViewport;

/** What the `Input` looks like with a placeholder. */
export const Placeholder = () => {
    const {register} = useForm();

    return <Input name="placeholder" placeholder={placeholderKnob()} ref={register()} />;
};

/** What the `Input` looks like with the dollar prefix. */
export const DollarPrefix = () => {
    const {register} = useForm();

    return <Input name="placeholder" placeholder="3.50" prefix="$" ref={register()} />;
};

/** What the `Input` looks like with the percentage prefix. */
export const PercentPrefix = () => {
    const {register} = useForm();

    return <Input name="placeholder" placeholder="3.50" prefix="%" ref={register()} />;
};

/** What the `Input`'s error state looks like. */
export const Error = () => <Input defaultValue="test@test.com" error={boolean("Error", true)} />;

/** The `Input` with an optional right icon. */
export const RightIcon = () => (
    <Input
        placeholder="Pick an account"
        RightIcon={ChevronDownIcon}
        error={boolean("Error", false)}
    />
);

/** The `Input` with an optional right icon _button_. */
export const RightIconButton = () => (
    <Input
        placeholder="Pick an account"
        RightIcon={ChevronDownIcon}
        rightIconButtonProps={{onClick: action("right icon click")}}
        error={boolean("Error", false)}
    />
);

/** The `Input` with an optional right icon _and_ error. */
export const RightIconWithError = () => (
    <Input
        placeholder="Pick an account"
        RightIcon={ChevronDownIcon}
        error={boolean("Error", true)}
    />
);

/** The `Input` with the success indicator. */
export const Success = () => (
    <Input
        placeholder="Pick a currency"
        hasSuccessState={true}
        showSuccess={boolean("Show Success Indicator", true)}
    />
);

/** The `Input` with the success indicator and a right icon. */
export const RightIconWithSuccess = () => (
    <Input
        placeholder="Pick a currency"
        RightIcon={ChevronDownIcon}
        hasSuccessState={true}
        showSuccess={boolean("Show Success Indicator", true)}
    />
);

/** The `Input` with the success indicator, the error icon, and a right icon for testing. */
export const RightIconWithSuccessAndError = () => (
    <Input
        placeholder="Pick a currency"
        RightIcon={ChevronDownIcon}
        error={boolean("Error", false)}
        hasSuccessState={true}
        showSuccess={boolean("Show Success Indicator", false)}
    />
);

/** What the `Input` looks like when it's disabled. */
export const Disabled = () => (
    <Input defaultValue="test@test.com" disabled={boolean("Disabled", true)} />
);

/** An `Input` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <Input containerClassName="Element--story-FocusOutline" defaultValue="test@test.com" />
);
