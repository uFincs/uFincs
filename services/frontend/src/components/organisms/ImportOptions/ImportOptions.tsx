import classNames from "classnames";
import {useMemo} from "react";
import {DocumentIcon} from "assets/icons";
import {ImportOptionButton} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./ImportOptions.scss";

const useGenerateOptions = (onImportCSV: () => void) =>
    useMemo(() => [{Icon: DocumentIcon, label: "CSV File", onClick: onImportCSV}], [onImportCSV]);

interface ImportOptionsProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** All of the options for importing data in. */
const ImportOptions = ({className, onImportCSV}: ImportOptionsProps) => {
    const options = useGenerateOptions(onImportCSV);

    return (
        <div className={classNames("ImportOptions", className)}>
            {options.map((props) => (
                <ImportOptionButton key={props.label} {...props} />
            ))}
        </div>
    );
};

export const PureComponent = ImportOptions;
export const ConnectedImportOptions = connect(ImportOptions);
export default ConnectedImportOptions;
