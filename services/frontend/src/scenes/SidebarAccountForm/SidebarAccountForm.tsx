import React from "react";
import {Sidebar} from "components/atoms";
import {AccountForm} from "components/organisms";
import connect, {ConnectedProps} from "./connect";
import "./SidebarAccountForm.scss";

interface SidebarAccountFormProps extends ConnectedProps {}

/** The top-level scene for showing the `AccountForm` in a `Sidebar`. */
const SidebarAccountForm = ({isVisible, onClose}: SidebarAccountFormProps) => (
    <Sidebar
        className="SidebarAccountForm"
        aria-label="Account Form"
        isVisible={isVisible}
        onClose={onClose}
    >
        <AccountForm onClose={onClose} />
    </Sidebar>
);

export const PureComponent = SidebarAccountForm;
export default connect(SidebarAccountForm);
