import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import {linkTo} from "@storybook/addon-links";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import ScreenUrls from "values/screenUrls";
import StoryRouter from "../../../.storybook/storyRouterDecorator";
import {PureComponent as Authentication} from "./Authentication";

export default {
    title: "Scenes/Authentication",
    component: Authentication,
    decorators: [
        StoryRouter({
            [ScreenUrls.LOGIN]: linkTo("Scenes/Authentication", "Login"),
            [ScreenUrls.SIGN_UP]: linkTo("Scenes/Authentication", "Sign Up")
        })
    ]
};

const authenticationActions = actions("onLogin", "onSignUp", "onLoginWithoutAccount");

const loginRoute = {path: ScreenUrls.LOGIN, params: [], isExact: true, url: ScreenUrls.LOGIN};
const signUpRoute = {path: ScreenUrls.SIGN_UP, params: [], isExact: true, url: ScreenUrls.SIGN_UP};

/** The `login` type of the `Authentication` scene. */
export const Login = () => <Authentication match={loginRoute} {...authenticationActions} />;

/** The `signup` type of the `Authentication` scene. */
export const SignUp = () => <Authentication match={signUpRoute} {...authenticationActions} />;

/** What the `Authentication` scene looks like on small devices. */
export const Small = () => <Authentication {...authenticationActions} />;

Small.parameters = smallViewport;

/** What the `Authentication` scene looks like on small landscape devices. */
export const SmallLandscape = () => <Authentication {...authenticationActions} />;

SmallLandscape.parameters = smallLandscapeViewport;

/** The `Authentication` scene when it encounters an error while submitting. */
export const Error = () => (
    <Authentication
        error={text("Error Message", "Wrong email or password")}
        {...authenticationActions}
    />
);

/** The `Authentication` scene while loading after the user submits. */
export const Loading = () => (
    <Authentication loading={boolean("Loading", true)} {...authenticationActions} />
);
