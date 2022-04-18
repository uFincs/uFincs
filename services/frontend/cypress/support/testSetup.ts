import localForage from "../../src/store/localForage";

export const testSetup = () => {
    before(() => {
        // This `firstRun` thing is because Cypress has a bug where it is executing `before` twice.
        // Cypress seems to import/execute the support files twice.
        // As such, we need a less ephemeral state than a regular variable to make sure it only runs once.
        // For reference: https://github.com/cypress-io/cypress/issues/2777#issuecomment-580778536
        // @ts-ignore Need to ts-ignore since `firstRun` is a custom config property.
        if (Cypress.config("firstRun")) {
            // @ts-ignore
            Cypress.config("firstRun", false);

            // Reset the database before any tests are run to get it into a consistent state.
            cy.resetDb();
        }
    });

    beforeEach(() => {
        // Need to clear IndexedDB before every test to make sure the Redux store is cleared.
        // Why do we need to do this manually? Because Cypress seems to only clear localStorage
        // between test runs, but makes _us_ have to do it for IndexedDB.
        //
        // See https://github.com/cypress-io/cypress/issues/1208 for reference.
        return localForage.clear();
    });
};
