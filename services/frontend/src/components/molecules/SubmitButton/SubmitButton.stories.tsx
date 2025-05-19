import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {useEffect, useState} from "react";
import {Button} from "components/atoms";
import {smallViewport, storyUsingHooks} from "utils/stories";
import SubmitButton from "./SubmitButton";

const meta: Meta<typeof SubmitButton> = {
    title: "Molecules/Submit Button",
    component: SubmitButton,
    args: {
        children: "Label",
        error: "Wrong email or password"
    }
};

export default meta;
type Story = StoryObj<typeof SubmitButton>;

const clickAction = () => action("clicked");

const useMakeFunctional = (errorMessage: string) => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [clickCount, setClickCount] = useState(0);

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
export const Normal: Story = {
    render: storyUsingHooks(({children, error: errorMessage, ...args}) => {
        const {clickCount, error, loading, onClick} = useMakeFunctional(errorMessage);

        return (
            <>
                <p className="SubmitButton--story-default-instructions">
                    {clickCount % 2 === 0
                        ? "Click to see the error state!"
                        : "Click to see the loading state!"}
                </p>
                <SubmitButton error={error} loading={loading} onClick={onClick} {...args}>
                    {children}
                </SubmitButton>
            </>
        );
    })
};

/** What the `SubmitButton` looks like on small devices. */
export const Small: Story = {
    render: storyUsingHooks(({children, error: errorMessage, ...args}) => {
        const {error, loading, onClick} = useMakeFunctional(errorMessage);

        return (
            <SubmitButton error={error} loading={loading} onClick={onClick} {...args}>
                {children}
            </SubmitButton>
        );
    }),
    parameters: {
        ...smallViewport
    }
};

/** The `SubmitButton` can display an error message above itself.
 *  Useful when submitting a form.. has errors. */
export const Error: Story = {};

/** A error message that is too long should wrap around once it hits the edge of
 *  the `SubmitButton`'s container. This can be seen, for example, on a small viewport
 *  like the iPhone 5. */
export const ErrorTooLong: Story = {
    args: {
        error: "Wrong email or password or something or something else or your face"
    }
};

/** The loading state of a `SubmitButton`.
 *  The button should be locked out from performing any actions during this state. */
export const Loading: Story = {
    args: {
        loading: true
    }
};

/** The `SubmitButton` with a custom `Button` element.
 *  Useful for replacing the `ShadowButton` with a regular `Button`. */
export const CustomButton: Story = {
    render: storyUsingHooks(({children, error: errorMessage, ...args}) => {
        const {error, loading, onClick} = useMakeFunctional(errorMessage);

        return (
            <SubmitButton
                Button={Button}
                error={error}
                loading={loading}
                onClick={onClick}
                {...args}
            >
                {children}
            </SubmitButton>
        );
    })
};
