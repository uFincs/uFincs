import classNames from "classnames";
import {PureTransactionForm} from "components/organisms/TransactionForm";
import connect, {ConnectedProps} from "./connect";
import "./TransactionsImportEditForm.scss";

// Need a (fixed) no-op function for `onNewTransaction`, since it isn't used for this component.
const noOp = () => {};

interface TransactionsImportEditFormProps extends ConnectedProps {}

/** A version of the `TransactionForm` tailored for editing transactions as part of the
 *  import process. In practice, this means changing the URL for how the form gets the
 *  transaction ID, along with being able to specify the `targetAccount` as a placeholder
 *  value for one of the account inputs. */
const TransactionsImportEditForm = ({
    className,
    ...otherProps
}: TransactionsImportEditFormProps) => (
    <PureTransactionForm
        className={classNames("TransactionsImportEditForm", className)}
        isEditing={true}
        onNewTransaction={noOp}
        {...otherProps}
    />
);

export const ConnectedTransactionsImportEditForm = connect(TransactionsImportEditForm);
export default ConnectedTransactionsImportEditForm;
