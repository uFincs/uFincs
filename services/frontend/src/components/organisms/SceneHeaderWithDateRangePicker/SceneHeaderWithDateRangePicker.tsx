import classNames from "classnames";
import React from "react";
import {OverlineHeading} from "components/atoms";
import {AppRefreshButton, ShowFutureToggle} from "components/molecules";
import {DateRangePicker} from "components/organisms";
import "./SceneHeaderWithDateRangePicker.scss";

interface SceneHeaderWithDateRangePickerProps {
    /** Custom class name. */
    className?: string;

    /** The title of the scene. */
    title: string;
}

/** A header for a Scene that has a title and DateRangePicker. This needs its own component
 *  for the custom responsive styles to make the DateRangePicker fit in one or two rows. */
const SceneHeaderWithDateRangePicker = ({
    className,
    title
}: SceneHeaderWithDateRangePickerProps) => (
    <div className={classNames("SceneHeaderWithDateRangePicker", className)}>
        <div className="SceneHeaderWithDateRangePicker-heading-container">
            <OverlineHeading>{title}</OverlineHeading>

            <div className="SceneHeaderWithDateRangePicker-heading-container-right-half">
                <AppRefreshButton />
                <ShowFutureToggle />
            </div>
        </div>

        <DateRangePicker />
    </div>
);

export default SceneHeaderWithDateRangePicker;
