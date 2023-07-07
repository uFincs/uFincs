import {select} from "@storybook/addon-knobs";
import React, {useEffect, useState} from "react";
import {Account, Transaction} from "models/";
import TransactionTypeSummary from "./TransactionTypeSummary";

export default {
    title: "Molecules/Transaction Type Summary",
    component: TransactionTypeSummary
};

const type = () => select("Type", [Transaction.INCOME, Transaction.EXPENSE], Transaction.INCOME);

// Note: The accounts list should be passed in sorted by balance descending, since the component
// doesn't perform the sorting itself.
//
// Why should the sorting be done externally? 1, so that the logic is external to the component
// and can be re-used elsewhere in the future (i.e. a react-native app), but mostly 2, so that
// we can test the animations using list shuffles, as shown below.
const accounts = [
    new Account({name: "Salary", balance: 150000}),
    new Account({name: "Other Income", balance: 50000}),
    new Account({name: "Interest", balance: 10000})
];

const newAccounts = [
    ...accounts,
    new Account({name: "Thing 1", balance: 10000}),
    new Account({name: "Thing 2", balance: 10000}),
    new Account({name: "Thing 3", balance: 100000})
];

/** The default view of `TransactionTypeSummary`. */
export const Default = () => (
    <TransactionTypeSummary
        accounts={accounts}
        hiddenAccountsMap={{}}
        type={type()}
        toggleAccountVisibility={() => () => {}}
    />
);

/** A test of the animation capabilities by shuffling account position and adding new accounts. */
export const AnimationTest = () => {
    const [sortedAccounts, set] = useState(accounts);

    useEffect(() => {
        const timer = setInterval(() => {
            set(() => {
                if (Math.random() > 0.5) {
                    // Need to create a new array instance each time, since the sort happens in place
                    // (even though it also returns the result). Otherwise, the story won't re-render.
                    return [...accounts.sort(() => 0.5 - Math.random())];
                } else {
                    return [...newAccounts.sort(() => 0.5 - Math.random())];
                }
            });
        }, 2000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return (
        <TransactionTypeSummary
            accounts={sortedAccounts}
            hiddenAccountsMap={{}}
            type={type()}
            toggleAccountVisibility={() => () => {}}
        />
    );
};
