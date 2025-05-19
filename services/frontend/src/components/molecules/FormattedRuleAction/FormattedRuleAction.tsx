import classNames from "classnames";
import {TextField} from "components/atoms";
import {ImportRuleAction} from "models/";
import {ValueFormatting} from "services/";
import connect, {ConnectedProps} from "./connect";

interface FormattedRuleActionProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** Whether the ", and" shouldn't be displayed for the last item. */
    isLastItem?: boolean;

    /** All of the properties that we need from the rule's action. */
    ruleAction: Pick<ImportRuleAction, "property" | "value">;
}

/** The text item with all the formatting needed to display a rule's action. */
const FormattedRuleAction = ({
    className,
    accountsById = {},
    isLastItem = false,
    ruleAction
}: FormattedRuleActionProps) => {
    const property = ImportRuleAction.formatProperty(ruleAction.property);

    const value = (() => {
        const {value} = ruleAction;

        switch (ruleAction.property) {
            case ImportRuleAction.PROPERTY_ACCOUNT:
                return accountsById?.[value]?.name;
            case ImportRuleAction.PROPERTY_DESCRIPTION:
                return value;
            case ImportRuleAction.PROPERTY_TYPE:
                return ValueFormatting.capitalizeString(value);
        }
    })();

    return (
        <TextField className={classNames("FormattedRuleAction", className)}>
            <strong>{property}</strong> to &quot;<strong>{value}</strong>
            &quot;
            {isLastItem ? "" : ", and"}
        </TextField>
    );
};

export const ConnectedFormattedRuleAction = connect(FormattedRuleAction);
export default ConnectedFormattedRuleAction;
