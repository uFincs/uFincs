import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {DerivedAppModalUrls, DerivedAppScreenUrls} from "values/screenUrls";

export interface ConnectedProps {
    /** Callback when clicking on the `Account` item.
     *  Show the user the New Account form. */
    onAccount: () => void;

    /** Callback when clicking on the `Import Transactions` item.
     *  Redirect the user to the import form. */
    onImportTransactions: () => void;

    /** Callback when clicking on the `Transaction` item.
     *  Show the user the new Transaction form. */
    onTransaction: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch): ConnectedProps => ({
    onAccount: () => dispatch(push(DerivedAppModalUrls.ACCOUNT_FORM)),
    onImportTransactions: () => dispatch(push(DerivedAppScreenUrls.IMPORT_OVERVIEW)),
    onTransaction: () => dispatch(push(DerivedAppModalUrls.TRANSACTION_FORM))
});

export default connect(null, mapDispatchToProps);
