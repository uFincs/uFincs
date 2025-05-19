import {Sidebar} from "components/atoms";
import {ImportRuleForm} from "components/organisms";
import connect, {ConnectedProps} from "./connect";
import "./SidebarImportRuleForm.scss";

interface SidebarImportRuleFormProps extends ConnectedProps {}

/** The top-level scene for showing the `ImportRuleForm` in a `Sidebar`. */
const SidebarImportRuleForm = ({isVisible, onClose}: SidebarImportRuleFormProps) => (
    <Sidebar
        className="SidebarImportRuleForm"
        aria-label="Import Rule Form"
        isVisible={isVisible}
        onClose={onClose}
    >
        <ImportRuleForm onClose={onClose} />
    </Sidebar>
);

export const PureComponent = SidebarImportRuleForm;
const ConnectedSidebarImportRuleForm = connect(SidebarImportRuleForm);
export default ConnectedSidebarImportRuleForm;
