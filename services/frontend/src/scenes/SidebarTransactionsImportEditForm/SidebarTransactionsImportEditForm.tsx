import {Sidebar} from "components/atoms";
import {TransactionsImportEditForm} from "components/organisms";
import {TransactionsSearchProvider} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./SidebarTransactionsImportEditForm.scss";

interface SidebarTransactionsImportEditFormProps extends ConnectedProps {}

/** The top-level scene for showing the `TransactionForm` in a `Sidebar`. */
const SidebarTransactionsImportEditForm = ({
    isVisible,
    onClose
}: SidebarTransactionsImportEditFormProps) => (
    <Sidebar
        className="SidebarTransactionsImportEditForm"
        aria-label="Transaction Form"
        isVisible={isVisible}
        onClose={onClose}
    >
        {/* Note: The search provider must go _inside_ the Sidebar; otherwise, if it goes outside,
        then it will always be rendered (because it won't be affected by the Sidebar's isVisible
        prop), which means that its state will persist. A side effect of letting the state persist
        is that the selected transaction will persist between open/closing the form. */}
        <TransactionsSearchProvider>
            <TransactionsImportEditForm onClose={onClose} />
        </TransactionsSearchProvider>
    </Sidebar>
);

export const PureComponent = SidebarTransactionsImportEditForm;
const ConnectedSidebarTransactionsImportEditForm = connect(SidebarTransactionsImportEditForm);
export default ConnectedSidebarTransactionsImportEditForm;
