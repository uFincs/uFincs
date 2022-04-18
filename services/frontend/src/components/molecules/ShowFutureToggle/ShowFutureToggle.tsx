import classNames from "classnames";
import React, {useEffect, useState} from "react";
import {OptionCard} from "components/atoms";
import {useOnActiveKey} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./ShowFutureToggle.scss";

interface ShowFutureToggleProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The toggle button that handles whether or not future/virtual transactions
 *  are shown/included in calculations */
const ShowFutureToggle = ({
    className,
    active,
    hasFutureTransactions = true,
    onToggle
}: ShowFutureToggleProps) => {
    const transitionsEnabled = useDelayedTransitions(active);
    const onKeyDown = useOnActiveKey(onToggle);

    return hasFutureTransactions ? (
        <OptionCard
            className={classNames(
                "ShowFutureToggle",
                {
                    "ShowFutureToggle--active": active,
                    "ShowFutureToggle--transitions-enabled": transitionsEnabled
                },
                className
            )}
            data-testid="show-future-toggle"
            role="checkbox"
            aria-checked={active}
            aria-label="Show Future Transactions"
            tabIndex={0}
            active={active}
            title="Show future/scheduled transactions and include them in calculations"
            onClick={onToggle}
            onKeyDown={onKeyDown}
        >
            Show Future
        </OptionCard>
    ) : null;
};

export const PureComponent = ShowFutureToggle;
export default connect(ShowFutureToggle);

/* Helper Functions */

// This hook basically allows us to toggle a class that enables/disables the transitions on the button.
//
// We want to do this so that there isn't a background-color transition when going from inactive
// to active, which looks really, _really_ stupid (what with the empty white background awkwardly
// transitioning to the colored background).
//
// Works by the power of ye-olde `setTimeout`.
const useDelayedTransitions = (active: boolean) => {
    const [transitionsEnabled, setTransactionsEnabled] = useState(active);

    useEffect(() => {
        setTimeout(() => {
            setTransactionsEnabled(active);
        }, 10);
    }, [active]);

    return transitionsEnabled;
};
