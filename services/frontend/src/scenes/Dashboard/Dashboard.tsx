import classNames from "classnames";
import {memo} from "react";
import {DelayedRender} from "components/atoms";
import {IncomeExpenseChart, NetWorthChart} from "components/charts";
import {
    AccountSummaries,
    RecentTransactionsList,
    SceneHeaderWithDateRangePicker
} from "components/organisms";
import {useScrollToTopOn} from "hooks/";
import "./Dashboard.scss";

interface DashboardProps {
    /** Custom class name. */
    className?: string;
}

/** The Dashboard scene. Shows some pretty charts and graphics summarizing the user's finances. */
const Dashboard = memo(
    ({className}: DashboardProps) => {
        // Normally the AppRouter handles scrolling to the top on route changes,
        // but when exiting the onboarding process there is no route change.
        // As such, in order to scroll to the top when exiting the onboarding process, we need to
        // invoke it here in the scene.
        useScrollToTopOn(true);

        return (
            <main className={classNames("Dashboard", className)}>
                <SceneHeaderWithDateRangePicker className="Dashboard-header" title="Dashboard" />

                <AccountSummaries className="Dashboard-AccountSummaries" />

                <DelayedRender>
                    <div className="Dashboard-content">
                        <NetWorthChart className="Dashboard-NetWorthChart" />
                        <IncomeExpenseChart className="Dashboard-IncomeExpenseChart" />

                        <RecentTransactionsList className="Dashboard-RecentTransactionsList" />
                    </div>
                </DelayedRender>
            </main>
        );
    },
    (prevProps, nextProps) => prevProps.className === nextProps.className
);

export default Dashboard;
