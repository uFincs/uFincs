// The email change request can happen really fast, which isn't a good UX since the loading state
// will end _very_ quickly. As such, we want a small delay to make the user think is something is going on.
export const AUTH_CHANGE_EMAIL = 2000;

// When redirecting the user because they're trying to access the login screen while authenticated
// or while trying to access the app while unauthenticated, there needs to be a small delay
// before performing the redirection, otherwise it doesn't work (sometimes). It seems like the
// router just can't keep up with the instant route changes.
export const AUTH_REDIRECTION = 50;

// Need a small delay to allow the splash screen to show fully before navigating to the app
// to allow it to render while the splash screen distracts the user.
export const LOGIN_GO_TO_APP = 500;

// This _should_ be enough time for everything to fully render underneath the splash screen.
// Also, it should be enough time for users to appreciate our wonderfully animated splash screen.
// Also, it gives us an easy out for 'improving' performance in the future.
export const LOGIN_SPLASH_SCREEN = 3000;

// The core onboarding logic actually happens really fast. However, we want to slow it down so that
// users think something.. _substantial_ is happening.
export const ONBOARDING_SUBMIT = 2000;

// Want a little delay to allow the success toast to render, before switching to the app.
export const ONBOARDING_SUCCESS_TOAST = 500;
