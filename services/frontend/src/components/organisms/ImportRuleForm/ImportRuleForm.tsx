import classNames from "classnames";
import {Fragment} from "react";
import {FormProvider} from "react-hook-form";
import {Thinking} from "assets/graphics";
import {OutlineButton} from "components/atoms";
import {EmptyArea, FormContainer, RuleActionCard, RuleConditionCard} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import {useImportRuleForm} from "./hooks";
import "./ImportRuleForm.scss";

interface ImportRuleFormProps extends ConnectedProps {}

/** A form for creating or editing an Import Rule. */
const ImportRuleForm = ({
    className,
    importRuleForEditing,
    isEditing = false,
    onClose,
    onSubmit,
    onNewRule
}: ImportRuleFormProps) => {
    const {
        actionsField,
        addActionDisabled,
        addConditionDisabled,
        conditionsField,
        formMethods,
        submissionError,
        onAddAction,
        onAddCondition,
        formOnKeyDown,
        formOnSubmit,
        onMakeAnother
    } = useImportRuleForm(importRuleForEditing, onClose, onSubmit);

    return isEditing && !importRuleForEditing ? (
        <FormContainer
            className={classNames("ImportRuleForm", className)}
            closeButtonTestId="import-rule-form-close-button"
            data-testid="import-rule-form"
            entityName="Import Rule"
            isEditing={isEditing}
            isInvalidForm={true}
            onClose={onClose}
        >
            <InvalidRuleForEditing onNewRule={onNewRule} />
        </FormContainer>
    ) : (
        <FormProvider {...formMethods}>
            <FormContainer
                className={classNames("ImportRuleForm", className)}
                data-testid="import-rule-form"
                closeButtonTestId="import-rule-form-close-button"
                entityName="Import Rule"
                isEditing={isEditing}
                submissionError={submissionError}
                onClose={onClose}
                onMakeAnother={onMakeAnother}
                onSubmit={formOnSubmit}
                onKeyDown={formOnKeyDown}
            >
                <div className="ImportRuleForm-conditions-container">
                    <h2 className="ImportRuleForm-subheading">When a transaction...</h2>

                    <div
                        className="ImportRuleForm-conditions"
                        data-testid="import-rule-form-conditions"
                    >
                        {conditionsField.fields.length === 0 && (
                            <p>You need at least 1 condition</p>
                        )}

                        {conditionsField.fields.map((condition, index) => (
                            <Fragment key={condition.id}>
                                <RuleConditionCard
                                    defaultCondition={condition.condition}
                                    defaultProperty={condition.property}
                                    defaultValue={condition.value}
                                    index={index}
                                    onRemove={() => conditionsField.remove(index)}
                                />

                                {index !== conditionsField.fields.length - 1 && <p>and</p>}
                            </Fragment>
                        ))}
                    </div>

                    <OutlineButton
                        disabled={addConditionDisabled}
                        title={addConditionDisabled ? "All properties are in use" : ""}
                        onClick={onAddCondition}
                    >
                        Add Condition
                    </OutlineButton>
                </div>

                <div className="ImportRuleForm-actions-container">
                    <h2 className="ImportRuleForm-subheading">Change...</h2>

                    <div className="ImportRuleForm-actions" data-testid="import-rule-form-actions">
                        {actionsField.fields.length === 0 && <p>You need at least 1 action</p>}

                        {actionsField.fields.map((action, index) => (
                            <Fragment key={action.id}>
                                <RuleActionCard
                                    defaultProperty={action.property}
                                    defaultValue={action.value}
                                    index={index}
                                    onRemove={() => actionsField.remove(index)}
                                />

                                {index !== actionsField.fields.length - 1 && <p>and</p>}
                            </Fragment>
                        ))}
                    </div>

                    <OutlineButton
                        disabled={addActionDisabled}
                        title={addActionDisabled ? "All properties are in use" : ""}
                        onClick={onAddAction}
                    >
                        Add Action
                    </OutlineButton>
                </div>
            </FormContainer>
        </FormProvider>
    );
};

export const PureComponent = ImportRuleForm;
export const ConnectedImportRuleForm = connect(ImportRuleForm);
export default ConnectedImportRuleForm;

/* Other Components */

interface InvalidRuleForEditingProps {
    /** Handler for redirecting the user to the New Import Rule form. */
    onNewRule: () => void;
}

/** The view to show when the user is trying to edit an invalid import rule.
 *  It should prompt the user to instead try creating a rule. */
const InvalidRuleForEditing = ({onNewRule}: InvalidRuleForEditingProps) => (
    <EmptyArea
        className="ImportRuleForm-EmptyArea"
        Graphic={Thinking}
        title="This isn't an import rule?"
        message="Hmm, doesn't seem like there's an import rule here."
        subMessage="How about creating a new one instead?"
        actionLabel="New Rule"
        onClick={onNewRule}
    />
);
