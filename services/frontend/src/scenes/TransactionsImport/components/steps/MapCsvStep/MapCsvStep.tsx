import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {StepDescription, TabBarWithSections} from "components/molecules";
import ExistingProfileSection from "./ExistingProfileSection";
import NewProfileSection from "./NewProfileSection";
import connect, {ConnectedProps} from "./connect";
import "./MapCsvStep.scss";

/* Main Component */

const newTab = [
    {
        label: "Create New Format",
        labelId: "map-csv-step-new-format-tab",
        controlsId: "map-csv-step-new-format"
    }
];

const allTabs = [
    {
        label: "Use Existing Format",
        labelId: "map-csv-step-existing-format-tab",
        controlsId: "map-csv-step-existing-format"
    },
    ...newTab
];

interface MapCsvStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The third step of the Transactions Import process, the Map CSV step is where
 *  the user relates the columns of the CSV file they uploaded to the transaction fields
 *  of uFincs to create a new 'CSV Format' (internally known as an 'ImportProfile'). */
const MapCsvStep = ({
    className,
    activeTab = 0,
    anyExistingProfiles = true,
    setActiveTab
}: MapCsvStepProps) => (
    <div className={classNames("MapCsvStep", className)}>
        <StepDescription title="How is your CSV file setup?">
            <TextField>
                Now you need to <strong>match</strong> the <strong>columns</strong> of your file to
                the <strong>fields</strong> that uFincs expects.
                <br /> <br />
                We&apos;ll <strong>save</strong> this <strong>CSV format</strong> so that you can
                use it for <strong>future imports.</strong>
            </TextField>
        </StepDescription>

        <div className="MapCsvStep-body">
            <TabBarWithSections
                activeTab={activeTab}
                tabs={anyExistingProfiles ? allTabs : newTab}
                setActiveTab={setActiveTab}
            >
                {anyExistingProfiles && <ExistingProfileSection />}
                <NewProfileSection />
            </TabBarWithSections>
        </div>
    </div>
);

export const PureComponent = MapCsvStep;
export default connect(MapCsvStep);
