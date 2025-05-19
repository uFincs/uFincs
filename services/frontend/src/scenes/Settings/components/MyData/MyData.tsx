import classNames from "classnames";
import {BackupDataForm, RestoreDataForm} from "components/organisms";
import "./MyData.scss";

interface MyDataProps {
    /** Custom class name. */
    className?: string;
}

/** The combined layout for the My Data section of the Settings. */
const MyData = ({className}: MyDataProps) => (
    <div className={classNames("MyData", className)}>
        <BackupDataForm />
        <RestoreDataForm />
    </div>
);

export default MyData;
