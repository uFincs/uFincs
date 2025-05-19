// import {linkTo} from "@storybook/addon-links";
import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import ScreenUrls from "values/screenUrls";
// import StoryRouter from "../../../.storybook/storyRouterDecorator";
import {PureComponent as Authentication} from "./Authentication";

const meta: Meta<typeof Authentication> = {
    title: "Scenes/Authentication",
    component: Authentication,
    // Tech Debt: Whatever this is supposed to do.
    // decorators: [
    //     StoryRouter({
    //         [ScreenUrls.LOGIN]: linkTo("Scenes/Authentication", "Login"),
    //         [ScreenUrls.SIGN_UP]: linkTo("Scenes/Authentication", "Sign Up")
    //     })
    // ],
    args: {
        error: "Wrong email or password",
        loading: false
    }
};

export default meta;
type Story = StoryObj<typeof Authentication>;

const loginRoute = {path: ScreenUrls.LOGIN, params: [], isExact: true, url: ScreenUrls.LOGIN};
const signUpRoute = {path: ScreenUrls.SIGN_UP, params: [], isExact: true, url: ScreenUrls.SIGN_UP};

/** The `login` type of the `Authentication` scene. */
export const Login: Story = {
    args: {
        match: loginRoute
    }
};

/** The `signup` type of the `Authentication` scene. */
export const SignUp: Story = {
    args: {
        match: signUpRoute
    }
};

/** What the `Authentication` scene looks like on small devices. */
export const Small: Story = {
    parameters: {...smallViewport}
};

/** What the `Authentication` scene looks like on small landscape devices. */
export const SmallLandscape: Story = {
    parameters: {...smallLandscapeViewport}
};

/** The `Authentication` scene when it encounters an error while submitting. */
export const Error: Story = {
    args: {
        error: "Wrong email or password"
    }
};

/** The `Authentication` scene while loading after the user submits. */
export const Loading: Story = {
    args: {
        loading: true
    }
};
