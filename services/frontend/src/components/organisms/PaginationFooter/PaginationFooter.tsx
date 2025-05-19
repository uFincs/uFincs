import classNames from "classnames";
import {Divider} from "components/atoms";
import {PaginationPageSize, PaginationSummary, PaginationSwitcher} from "components/molecules";
import "./PaginationFooter.scss";

interface PaginationFooterProps {
    /** Custom class name. */
    className?: string;

    /** The name of the item being paginated. See `PaginationSummary` for use. */
    itemName?: string;
}

/** The `PaginationFooter` combines the `PaginationSummary` and `PaginationSwitcher` with
 *  a `Divider` to have an all-in-one drop-in organism for enabling pagination anywhere. */
const PaginationFooter = ({className, itemName = "transactions"}: PaginationFooterProps) => (
    <div className={classNames("PaginationFooter", className)}>
        <Divider className="PaginationFooter-Divider" />

        <div className="PaginationFooter-wrapper">
            {/* See the explanation in the CSS for why we have two copies of the Switcher.
                tl;dr so that everything displays nicely across mobile and desktop */}
            <div className="PaginationFooter-first-half">
                <PaginationSummary itemName={itemName} />
                <PaginationSwitcher />
            </div>

            <div className="PaginationFooter-second-half">
                <PaginationPageSize />
                <PaginationSwitcher />
            </div>
        </div>
    </div>
);

export default PaginationFooter;
