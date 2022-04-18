import {actions} from "@storybook/addon-actions";
import React from "react";
import {Account} from "models/";
import {smallViewport} from "utils/stories";
import AccountForm, {PureComponent as PureAccountForm} from "./AccountForm";

export default {
    title: "Organisms/Account Form",
    component: PureAccountForm
};

const accountForEditing = new Account({
    name: "Test",
    openingBalance: 12345,
    interest: 1230,
    type: Account.ASSET
});

const formActions = actions("onClose", "onSubmit", "onNewAccount");

/** The default view of the `AccountForm`. */
export const Default = () => <PureAccountForm isEditing={false} {...formActions} />;

/** Small is the more realistic view of the `AccountForm`, since the form only takes up
 *  limited horizontal screen space when displayed in a `Sidebar`. */
export const Small = () => <PureAccountForm isEditing={false} {...formActions} />;

Small.parameters = smallViewport;

/** The view of the `AccountForm` when editing an account. */
export const Editing = () => (
    <PureAccountForm accountForEditing={accountForEditing} isEditing={true} {...formActions} />
);

Editing.parameters = smallViewport;

/** The view of the `AccountForm` when editing an invalid account. */
export const InvalidEditingAccount = () => <PureAccountForm isEditing={true} {...formActions} />;

InvalidEditingAccount.parameters = smallViewport;

/** A story for testing that the connected `AccountForm` is working. */
export const Connected = () => <AccountForm {...formActions} />;
