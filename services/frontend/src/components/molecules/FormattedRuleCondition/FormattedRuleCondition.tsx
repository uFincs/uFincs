import classNames from "classnames";
import {TextField} from "components/atoms";
import {ImportRuleCondition} from "models/";
import "./FormattedRuleCondition.scss";

interface FormattedRuleConditionProps {
    /** Custom class name. */
    className?: string;

    /** Whether the ", and" shouldn't be displayed for the last item. */
    isLastItem?: boolean;

    /** All of the properties that we need from the rule's condition. */
    ruleCondition: Pick<ImportRuleCondition, "condition" | "property" | "value">;
}

/** The text item with all the formatting needed to display a rule's condition. */
const FormattedRuleCondition = ({
    className,
    isLastItem = false,
    ruleCondition
}: FormattedRuleConditionProps) => {
    const condition = ImportRuleCondition.formatCondition(ruleCondition.condition);
    const property = ImportRuleCondition.formatProperty(ruleCondition.property);

    return (
        <TextField className={classNames("FormattedRuleCondition", className)}>
            <strong>{property}</strong> {condition} &quot;<strong>{ruleCondition.value}</strong>
            &quot;
            {isLastItem ? "" : ", and"}
        </TextField>
    );
};

export default FormattedRuleCondition;
