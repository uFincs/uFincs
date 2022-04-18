import classNames from "classnames";
import React from "react";
import {animated, useSpring, useTransition} from "react-spring";
import {Card, TextField} from "components/atoms";
import {useCurrencySymbol} from "hooks/";
import {AccountData, Transaction, TransactionType} from "models/";
import {ValueConversion, ValueFormatting} from "services/";
import {sizes} from "utils/parsedStyles";
import {Cents} from "utils/types";
import "./TransactionTypeSummary.scss";

// The natural height of the SingleAccountSummary is, actually, exactly 40px (plus like 0.05 or something).
const SingleAccountSummary_HEIGHT = 40;

// We add in size200 * 2 as the spacing between the items.
const TOTAL_ITEM_HEIGHT = SingleAccountSummary_HEIGHT + sizes.size200 * 2;

const EMPTY_MESSAGE_MAP = {
    [Transaction.INCOME]: "Didn't make any money...",
    [Transaction.EXPENSE]: "Didn't spend any money!"
};

interface TransactionTypeSummaryProps {
    /** Custom class name. */
    className?: string;

    /** The set of accounts (with calculated balances) to display for the given type. */
    accounts: Array<AccountData>;

    /** The type of transaction to be summarizing in this view.
     *  Realistically, it's only either Income or Expense. */
    type: TransactionType;
}

/** A summary of transactions for a given type that shows a visual breakdown of the amounts for
 *  each account (of the given type). */
const TransactionTypeSummary = ({className, accounts = [], type}: TransactionTypeSummaryProps) => {
    const maxBalance = Math.max(...accounts.map(({balance}) => balance || 0));
    const totalAmount = accounts.reduce((acc, {balance}) => acc + (balance || 0), 0);

    // This list transition makes it so that items re-arrange themselves (up and down) when
    // the accounts change. It uses y translates to position all of the items, instead
    // of the usual (static) approach of using a gapped grid.
    //
    // List transition methodology adapted from https://stackoverflow.com/a/56786194 and
    // https://codesandbox.io/embed/1wqpz5mzqj.
    const transitions = useTransition(
        accounts.map((data, i) => ({...data, y: TOTAL_ITEM_HEIGHT * i})),
        {
            // Note: Use `any` here cause otherwise react-spring complains.
            keys: (account: any) => account.id,
            from: {position: "absolute", opacity: 0},
            enter: ({y}) => ({y, opacity: 1}),
            leave: {opacity: 0},
            update: ({y}) => ({y})
        }
    );

    const {height: listHeight} = useSpring({
        // Subtract size200 to deal with the excess 'padding' height that gets added by the last item.
        height: TOTAL_ITEM_HEIGHT * accounts.length - sizes.size200
    });

    const items = transitions((style, {id, balance, name}) => (
        <animated.div
            key={id}
            style={
                {
                    height: TOTAL_ITEM_HEIGHT,
                    width: "100%",
                    ...style
                } as any
            }
        >
            <SingleAccountSummary
                key={id}
                balance={balance || 0}
                name={name}
                maxBalance={maxBalance}
                totalAmount={totalAmount}
                type={type}
            />
        </animated.div>
    ));

    return (
        <Card className={classNames("TransactionTypeSummary", className)}>
            <h2 className="TransactionTypeSummary-header">
                {Transaction.PLURAL_TYPES[type]} Summary
            </h2>

            {accounts.length === 0 ? (
                <p className="TransactionTypeSummary-empty-message">{EMPTY_MESSAGE_MAP[type]}</p>
            ) : (
                <animated.div style={{height: listHeight, position: "relative"}}>
                    {items}
                </animated.div>
            )}
        </Card>
    );
};

export default TransactionTypeSummary;

/* Other Components */

// These are the properties of the SVG line that is used to show the account's amount relative to
// each other account.

const LINE_STROKE_WIDTH = 3;

// Need slightly more height to accommodate the full line.
const VIEWBOX_HEIGHT = LINE_STROKE_WIDTH + 1;
const VIEWBOX_WIDTH = 100;

// The rounded endcap of the line adds ~2px to the 'length' of the line at each end of the line.
// As such, we have to account for it when determining the X coordinates of the line.
const LINE_ENDCAP_WIDTH = 2;
const LINE_X_START = LINE_ENDCAP_WIDTH;
const LINE_X_END = VIEWBOX_WIDTH - LINE_ENDCAP_WIDTH;
const LINE_LENGTH = LINE_X_END - LINE_X_START;

// Need to center the line within the viewbox.
const LINE_Y = VIEWBOX_HEIGHT / 2;

interface SingleAccountSummaryProps {
    /** The balance for this account. */
    balance: Cents;

    /** The name of the account. */
    name: string;

    /** The max balance of all accounts for the entire transaction type. */
    maxBalance: Cents;

    /** The total amount for the entire transaction type. */
    totalAmount: Cents;

    /** The type of transactions being represented by this account.
     *  Used to color the balance line. */
    type: TransactionType;
}

/** A summary of a single account in a given transaction type. */
const SingleAccountSummary = ({
    balance,
    name,
    maxBalance,
    totalAmount,
    type
}: SingleAccountSummaryProps) => {
    const currencySymbol = useCurrencySymbol();

    const {offset} = useSpring({
        // Remember a dash offset value of 0 means that the line is fully displayed.
        // As such, we animate from the full offset amount down to whatever percentage this account
        // represents.
        offset: LINE_LENGTH - LINE_LENGTH * (balance / maxBalance),
        from: {offset: LINE_LENGTH},
        // Want to delay the bars animating a bit, so that everything else has time to render in.
        // This helps bring the users attention to the bars.
        delay: 500
    });

    const formattedBalance = ValueFormatting.formatMoney(balance, {currencySymbol});
    const formattedTotalAmount = ValueFormatting.formatMoney(totalAmount, {currencySymbol});

    const formattedTotalPercentage = ValueFormatting.formatPercent(
        ValueConversion.convertPercentToMillipercents((balance / totalAmount) * 100),
        {decimalPlaces: 1}
    );

    const title =
        `${name} (${formattedBalance}) is ` +
        `${formattedTotalPercentage} of your total ${Transaction.PLURAL_TYPES[
            type
        ].toLowerCase()} (${formattedTotalAmount})`;

    return (
        <div className="SingleAccountSummary" title={title}>
            <div className="SingleAccountSummary-info">
                <TextField className="SingleAccountSummary-name">{name}</TextField>
                <TextField>{formattedBalance}</TextField>
            </div>

            <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}>
                <animated.line
                    className={classNames({
                        "SingleAccountSummary-line--income": type === Transaction.INCOME,
                        "SingleAccountSummary-line--expense": type === Transaction.EXPENSE
                    })}
                    x1={LINE_X_START}
                    y1={LINE_Y}
                    x2={LINE_X_END}
                    y2={LINE_Y}
                    strokeWidth={LINE_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={LINE_LENGTH}
                    strokeDashoffset={offset}
                />
            </svg>
        </div>
    );
};
