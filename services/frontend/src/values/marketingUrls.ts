import {MARKETING_URL} from "config";

// Note: These URLs are split off from `screenUrls` since they rely on an import to `config`,
// which we can't have imported into Cypress since Cypress/webpack doesn't like `import.meta.env`.
// Ref: https://github.com/cypress-io/cypress/issues/25187

export const MarketingUrls = {
    CHANGELOG: `${MARKETING_URL}/changelog`,
    LANDING: MARKETING_URL
};
