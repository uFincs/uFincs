import {Application} from "declarations";
import accounts from "./accounts/accounts.service";
import authManagement from "./authManagement/authManagement.service";
import billing from "./billing/billing.service";
import featureFlags from "./featureFlags/featureFlags.service";
import feedback from "./feedback/feedback.service";
import importProfileMappings from "./importProfileMappings/importProfileMappings.service";
import importProfiles from "./importProfiles/importProfiles.service";
import importRuleActions from "./importRuleActions/importRuleActions.service";
import importRuleConditions from "./importRuleConditions/importRuleConditions.service";
import importRules from "./importRules/importRules.service";
import internalNotifier from "./internalNotifier/internalNotifier.service";
import mailer from "./mailer/mailer.service";
import preferences from "./preferences/preferences.service";
import recurringTransactions from "./recurringTransactions/recurringTransactions.service";
import subscriptions from "./subscriptions/subscriptions.service";
import transactions from "./transactions/transactions.service";
import users from "./users/users.service";
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
    app.configure(accounts);
    app.configure(authManagement);
    app.configure(billing);
    app.configure(featureFlags);
    app.configure(feedback);
    app.configure(importProfileMappings);
    app.configure(importProfiles);
    app.configure(importRuleActions);
    app.configure(importRuleConditions);
    app.configure(importRules);
    app.configure(internalNotifier);
    app.configure(mailer);
    app.configure(preferences);
    app.configure(recurringTransactions);
    app.configure(subscriptions);
    app.configure(transactions);
    app.configure(users);
}
