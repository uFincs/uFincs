import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {useEffect, useState} from "react";
import {AuthType} from "components/molecules/AuthForm";
import {smallViewport, storyUsingHooks} from "utils/stories";
import CompleteAuthForm from "./CompleteAuthForm";

const meta: Meta<typeof CompleteAuthForm> = {
    title: "Organisms/Complete Auth Form",
    component: CompleteAuthForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof CompleteAuthForm>;

const submitAction = () => action("submitted");

const useEnableForm = () => {
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        submitAction()(data);
        setLoading(true);
    };

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    }, [loading, setLoading]);

    return {loading, onSubmit};
};

const useMakeFunctional = (defaultType: AuthType = AuthType.login) => {
    const {loading, onSubmit} = useEnableForm();
    const [type, setType] = useState(defaultType);

    const onAltClick = () => {
        action("alternative clicked")();

        if (type === AuthType.login) {
            setType(AuthType.signup);
        } else if (type === AuthType.signup) {
            setType(AuthType.login);
        }
    };

    const onLogin = (data: any) => {
        action("login submitted")();
        onSubmit(data);
    };

    const onSignUp = (data: any) => {
        action("signup submitted")();
        onSubmit(data);
    };

    return {loading, type, onLogin, onSignUp, onAltClick};
};

/** The `CompleteAuthForm` when the default type is `login`. */
export const Login: Story = {
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.login);

        return <CompleteAuthForm {...args} {...props} />;
    })
};

/** The `CompleteAuthForm` when the default type is `signup`. */
export const SignUp: Story = {
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.signup);

        return <CompleteAuthForm {...args} {...props} />;
    })
};

/** What the `CompleteAuthForm` looks like on small devices. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.login);

        return <CompleteAuthForm {...args} {...props} />;
    })
};

/** The external error state of the `CompleteAuthForm`. */
export const ExternalError: Story = {
    args: {
        error: "Wrong email or password"
    },
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.login);

        return <CompleteAuthForm {...args} {...props} />;
    })
};

/** The loading state of the `CompleteAuthForm`. */
export const Loading: Story = {
    args: {
        loading: true
    },
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.login);

        return <CompleteAuthForm {...args} {...props} />;
    })
};

/** The "Only Login Form" view of the `CompleteAuthForm`. */
export const OnlyLogin: Story = {
    args: {
        onlyLoginForm: true
    },
    render: storyUsingHooks((args) => {
        const props = useMakeFunctional(AuthType.login);

        return <CompleteAuthForm {...args} {...props} />;
    })
};
