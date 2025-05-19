import classNames from "classnames";
import {memo, useMemo} from "react";
import {Card, TextField} from "components/atoms";
import {TransactionTypeSummary} from "components/molecules";
import {useCurrencySymbol} from "hooks/";
import {AccountData, Transaction} from "models/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import {useHiddenAccounts, useTransactionsSummary} from "./hooks";
import "./TransactionsSummary.scss";

interface TransactionsSummaryProps {
    /** Custom class name. */
    className?: string;

    /** The total cash flow for the period (i.e. income - expenses). */
    cashFlow: Cents;

    /** The expense accounts. */
    expenseAccounts: Array<AccountData>;

    /** The income accounts. */
    incomeAccounts: Array<AccountData>;
}

/** A summary view for a list of transactions that breaks down the amounts by each income/expense
 *  account, as well as showing the overall cash flow. */
const TransactionsSummary = memo(
    ({className, expenseAccounts, incomeAccounts, cashFlow}: TransactionsSummaryProps) => {
        const {hiddenAccountsMap, toggleAccountVisibility} = useHiddenAccounts();

        const adjustedCashFlow = useMemo(() => {
            let adjustedCashFlow = cashFlow;

            for (const account of expenseAccounts) {
                if (hiddenAccountsMap[account.id]) {
                    adjustedCashFlow += account.balance || 0;
                }
            }

            for (const account of incomeAccounts) {
                if (hiddenAccountsMap[account.id]) {
                    adjustedCashFlow -= account.balance || 0;
                }
            }

            return adjustedCashFlow;
        }, [cashFlow, expenseAccounts, incomeAccounts, hiddenAccountsMap]);

        return (
            <div
                className={classNames("TransactionsSummary", className)}
                data-testid="transactions-summary"
            >
                <TransactionTypeSummary
                    accounts={incomeAccounts}
                    hiddenAccountsMap={hiddenAccountsMap}
                    type={Transaction.INCOME}
                    toggleAccountVisibility={toggleAccountVisibility}
                />

                <TransactionTypeSummary
                    accounts={expenseAccounts}
                    hiddenAccountsMap={hiddenAccountsMap}
                    type={Transaction.EXPENSE}
                    toggleAccountVisibility={toggleAccountVisibility}
                />

                <CashFlow cashFlow={adjustedCashFlow} />
            </div>
        );
    }
);

const WrappedTransactionsSummary = () => {
    const {cashFlow, expenseAccounts, incomeAccounts} = useTransactionsSummary();

    return (
        <TransactionsSummary
            cashFlow={cashFlow}
            expenseAccounts={expenseAccounts}
            incomeAccounts={incomeAccounts}
        />
    );
};

export const PureComponent = TransactionsSummary;
export default WrappedTransactionsSummary;

/* Other Components */

interface CashFlowProps {
    cashFlow: Cents;
}

const CashFlow = ({cashFlow}: CashFlowProps) => {
    const currencySymbol = useCurrencySymbol();

    return (
        <Card className="CashFlow">
            <h2 className="CashFlow-header">Cash Flow</h2>

            <TextField
                className={classNames("CashFlow-amount", {
                    "CashFlow-amount--positive": cashFlow >= 0,
                    "CashFlow-amount--negative": cashFlow < 0
                })}
            >
                {ValueFormatting.formatMoney(cashFlow, {currencySymbol})}
            </TextField>
        </Card>
    );
};
