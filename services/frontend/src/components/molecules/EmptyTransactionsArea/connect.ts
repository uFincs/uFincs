import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {DerivedAppModalUrls} from "values/screenUrls";
import {hashParams} from "values/transactionForm";

interface IntermediateDispatchProps {
    /** [intermediate] Handler for adding a new transaction when there are no transactions at all.
     *
     *  Needs to be passed the `isRecurringTransactions` OwnProp to determine the final handler. */
    onAddTransaction: (isRecurringTransactions: boolean) => void;
}

interface DispatchProps {
    /** Handler for adding a new transaction when there are no transactions at all. */
    onAddTransaction: () => void;
}

interface OwnProps {
    /** Whether or not to use messaging tailored for recurring transactions. */
    isRecurringTransactions?: boolean;
}

export interface ConnectedProps extends DispatchProps, OwnProps {}

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onAddTransaction: (isRecurringTransactions: boolean) => {
        if (isRecurringTransactions) {
            dispatch(push(`${DerivedAppModalUrls.TRANSACTION_FORM}#${hashParams.recurring}=true`));
        } else {
            dispatch(push(DerivedAppModalUrls.TRANSACTION_FORM));
        }
    }
});

const mergeProps = (
    stateProps: any,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => {
    const {onAddTransaction, ...otherDispatchProps} = dispatchProps;

    const finalOnAddTransaction = () => {
        onAddTransaction(ownProps.isRecurringTransactions || false);
    };

    return {
        ...stateProps,
        ...otherDispatchProps,
        ...ownProps,
        onAddTransaction: finalOnAddTransaction
    };
};

export default connect(null, mapDispatchToProps, mergeProps);
