import classNames from "classnames";
import {CurrencyPreferenceForm} from "components/organisms";
import "./MyPreferences.scss";

interface MyPreferencesProps {
    /** Custom class name. */
    className?: string;
}

/** The combined layout for the My Preferences section of the Settings. */
const MyPreferences = ({className}: MyPreferencesProps) => (
    <div className={classNames("MyPreferences", className)}>
        <CurrencyPreferenceForm />
    </div>
);

export default MyPreferences;
