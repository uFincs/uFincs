// Cypress compilation fails if this uses "config" instead "../config". Cause Webpack.
import {MARKETING_URL} from "../config";
// Cypress complication fails if this uses "services/" instead of the below. Cause absolute imports.
import NativePlatformsService from "../services/NativePlatformsService";

const ScreenUrls = {
    APP: "/app",
    CHECKOUT: "/checkout",
    LANDING: "/",
    LOGIN: "/login",
    NO_ACCOUNT_LOGIN: "/login/no-account",
    PASSWORD_RESET: "/password-reset/:token",
    SEND_PASSWORD_RESET: "/password-reset",
    SIGN_UP: "/signup"
} as const;

// These URLs get nested under the "/app" route
// These are used for things like Route components
export const AppScreenUrls = {
    DASHBOARD: "/",
    ACCOUNTS: "/accounts",
    ACCOUNT_DETAILS: "/accounts/:id",
    IMPORT_OVERVIEW: "/import",
    IMPORT_RULES: "/rules",
    NO_ACCOUNT_SIGN_UP: "/signup",
    ONBOARDING: "/setup",
    SETTINGS: "/settings",
    SETTINGS_BILLING: "/settings/billing",
    SETTINGS_DATA: "/settings/data",
    SETTINGS_IMPORT_PROFILES: "/settings/import",
    SETTINGS_PREFERENCES: "/settings/preferences",
    SETTINGS_USER_ACCOUNT: "/settings/user",
    TRANSACTIONS: "/transactions",
    TRANSACTIONS_IMPORT: "/import/transactions"
};

export const AppModalUrls = {
    ACCOUNT_FORM: "/account-form",
    ACCOUNT_FORM_EDITING: "/account-form/:id",
    IMPORT_RULE_FORM: "/rule-form",
    IMPORT_RULE_FORM_EDITING: "/rule-form/:id",
    RECURRING_TRANSACTION_FORM: "/recurring-transaction-form",
    RECURRING_TRANSACTION_FORM_EDITING: "/recurring-transaction-form/:id",
    TRANSACTION_FORM: "/transaction-form",
    TRANSACTION_FORM_EDITING: "/transaction-form/:id",
    TRANSACTIONS_IMPORT_FORM: `${AppScreenUrls.TRANSACTIONS_IMPORT}/transaction-form`,
    TRANSACTIONS_IMPORT_FORM_EDITING: `${AppScreenUrls.TRANSACTIONS_IMPORT}/transaction-form/:id`
};

// These are the combined URLs derived from ScreenUrls.APP and AppScreenUrls.
// These are used for things like Link components.
export const DerivedAppScreenUrls: typeof AppScreenUrls = (
    Object.keys(AppScreenUrls) as Array<keyof typeof AppScreenUrls>
).reduce<typeof AppScreenUrls>((acc, key) => {
    acc[key] = ScreenUrls.APP + AppScreenUrls[key];
    return acc;
}, {} as typeof AppScreenUrls);

export const DerivedAppModalUrls: typeof AppModalUrls = (
    Object.keys(AppModalUrls) as Array<keyof typeof AppModalUrls>
).reduce<typeof AppModalUrls>((acc, key) => {
    acc[key] = ScreenUrls.APP + AppModalUrls[key];
    return acc;
}, {} as typeof AppModalUrls);

// These modal URLs shouldn't cause the Transactions Import process to reset to step 0.
// See `transactionsImport.slice` for more details.
export const ModalsThatDontResetImport = [
    DerivedAppModalUrls.ACCOUNT_FORM,
    DerivedAppModalUrls.IMPORT_RULE_FORM,
    DerivedAppModalUrls.TRANSACTION_FORM
];

export const MarketingUrls = {
    CHANGELOG: `${MARKETING_URL}/changelog`,
    // Only if we're on the web should we be allowing users to go the Marketing site via
    // the usual suspects (i.e. the uFincs logo on the auth pages).
    //
    // Otherwise, they should just be redirected back to the login page of the app.
    // This way, there's one less external link for app store approvers to get mad about.
    LANDING: NativePlatformsService.isWeb() ? MARKETING_URL : ScreenUrls.LOGIN
};

export default ScreenUrls;
