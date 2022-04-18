import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React, {useEffect, useState} from "react";
import {Button} from "components/atoms";
import {smallViewport} from "utils/stories";
import SubmitButton from "./SubmitButton";

export default {
    title: "Molecules/Submit Button",
    component: SubmitButton
};

const clickAction = () => action("clicked");
const errorKnob = () => boolean("Error", true);
const errorMessageKnob = () => text("Error Message", "Wrong email or password");
const labelKnob = () => text("Label", "Login");

const useMakeFunctional = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    const errorMessage = errorMessageKnob();

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    }, [loading, setLoading]);

    const onClick = () => {
        clickAction()();

        // This just enables cycling between an error state and a loading state.
        // Just to make the story a bit more interactive/useful.
        if (clickCount % 2 === 0) {
            action("error")();
            setLoading(false);
            setError(errorMessage);
        } else {
            action("loading")();
            setError("");
            setLoading(true);
        }

        setClickCount(clickCount + 1);
    };

    return {clickCount, error, loading, onClick};
};

/** The normal view of a `SubmitButton`.
 *  Click it to see it cycle between error and loading states! */
export const Normal = () => {
    const {clickCount, error, loading, onClick} = useMakeFunctional();

    return (
        <>
            <p className="SubmitButton--story-default-instructions">
                {clickCount % 2 === 0
                    ? "Click to see the error state!"
                    : "Click to see the loading state!"}
            </p>
            <SubmitButton error={error} loading={loading} onClick={onClick}>
                {labelKnob()}
            </SubmitButton>
        </>
    );
};

/** What the `SubmitButton` looks like on small devices. */
export const Small = () => {
    const {error, loading, onClick} = useMakeFunctional();

    return (
        <SubmitButton error={error} loading={loading} onClick={onClick}>
            {labelKnob()}
        </SubmitButton>
    );
};

Small.parameters = smallViewport;

/** The `SubmitButton` can display an error message above itself.
 *  Useful when submitting a form.. has errors. */
export const Error = () => (
    <SubmitButton error={errorKnob() ? errorMessageKnob() : ""} onClick={clickAction()}>
        {labelKnob()}
    </SubmitButton>
);

/** A error message that is too long should wrap around once it hits the edge of
 *  the `SubmitButton`'s container. This can be seen, for example, on a small viewport
 *  like the iPhone 5. */
export const ErrorTooLong = () => (
    <SubmitButton
        error={
            errorKnob()
                ? text(
                      "Long Error Message",
                      "Wrong email or password or something or something else or your face"
                  )
                : ""
        }
        onClick={clickAction()}
    >
        {labelKnob()}
    </SubmitButton>
);

/** The loading state of a `SubmitButton`.
 *  The button should be locked out from performing any actions during this state. */
export const Loading = () => (
    <SubmitButton loading={boolean("Loading", true)} onClick={clickAction()}>
        {labelKnob()}
    </SubmitButton>
);

/** The `SubmitButton` with a custom `Button` element.
 *  Useful for replacing the `ShadowButton` with a regular `Button`. */
export const CustomButton = () => {
    const {error, loading, onClick} = useMakeFunctional();

    return (
        <SubmitButton Button={Button} error={error} loading={loading} onClick={onClick}>
            {labelKnob()}
        </SubmitButton>
    );
};
