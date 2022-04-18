// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./commands";
import ScreenUrls, {
    AppScreenUrls,
    DerivedAppModalUrls,
    DerivedAppScreenUrls
} from "../../src/values/screenUrls";
import {testSetup} from "./testSetup";

testSetup();

export {default as DateService} from "../../src/services/DateService";
export {default as ValueFormatting} from "../../src/services/ValueFormatting";
export {default as keyCodes} from "../../src/values/keyCodes";
export {AccountForm} from "./accountForm";
export {ImportRuleForm} from "./importRuleForm";
export {GlobalAddButton} from "./globalAddButton";
export * as helpers from "./helpers";
export {AppNavigation} from "./appNavigation";
export {FeedbackDialog, FeedbackForm} from "./feedbackDialog";
export {NoAccount} from "./noAccount";
export {default as sharedSelectors} from "./sharedSelectors";
export * as testData from "./testData";
export {seedData} from "./testData";
export * as transactionHelpers from "./transactionHelpers";
export {TransactionForm} from "./transactionForm";
export * as transactionsImport from "./transactionsImport";
export {SummaryStats} from "./transactionsImport";
export {UserSettings} from "./userSettings";
export {AppScreenUrls, DerivedAppModalUrls, DerivedAppScreenUrls, ScreenUrls};
