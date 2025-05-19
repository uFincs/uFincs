import {Meta, StoryObj} from "@storybook/react";
import {useEffect, useState} from "react";
import {Account, Transaction} from "models/";
import {storyUsingHooks} from "utils/stories";
import TransactionTypeSummary from "./TransactionTypeSummary";

// Mock data
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

const meta: Meta<typeof TransactionTypeSummary> = {
    title: "Molecules/Transaction Type Summary",
    component: TransactionTypeSummary,
    args: {
        accounts: accounts,
        hiddenAccountsMap: {},
        type: Transaction.INCOME,
        toggleAccountVisibility: () => () => {}
    }
};

export default meta;
type Story = StoryObj<typeof TransactionTypeSummary>;

/** The default view of `TransactionTypeSummary`. */
export const Default: Story = {};

/** A test of the animation capabilities by shuffling account position and adding new accounts. */
export const AnimationTest: Story = {
    render: storyUsingHooks((args) => {
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
                type={args.type}
                toggleAccountVisibility={() => () => {}}
            />
        );
    })
};
