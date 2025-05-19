import classNames from "classnames";
import {Divider} from "components/atoms";
import {DateRangeSizePicker, DateSwitcher, ShowFutureToggle} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./DateRangePicker.scss";

interface DateRangePickerProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The complete picker for choosing a date range, complete with the range size picker and
 *  date switcher. Fully self-contained; just drop in place and use. */
const DateRangePicker = ({className, hasFutureTransactions = false}: DateRangePickerProps) => (
    <div className={classNames("DateRangePicker", className)}>
        <DateRangeSizePicker />

        <div className="DateRangePicker-right-half">
            {hasFutureTransactions && <Divider orientation="vertical" />}
            <ShowFutureToggle />

            <DateSwitcher />
        </div>
    </div>
);

export const ConnectedDateRangePicker = connect(DateRangePicker);
export default ConnectedDateRangePicker;
