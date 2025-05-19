import classNames from "classnames";
import {FeedbackOption} from "components/molecules";
import {Feedback, FeedbackType} from "models/";
import "./FeedbackOptions.scss";

interface FeedbackOptionsProps {
    /** Custom class name. */
    className?: string;

    /** Handler for when one of the type options becomes selected. */
    onTypeSelected: (type: FeedbackType) => void;
}

/** The complete list of options for allowing a user to select a feedback type. */
const FeedbackOptions = ({className, onTypeSelected}: FeedbackOptionsProps) => (
    <div className={classNames("FeedbackOptions", className)}>
        {Feedback.FEEDBACK_TYPES.map((type) => (
            <FeedbackOption key={type} type={type} onSelected={onTypeSelected} />
        ))}
    </div>
);

export default FeedbackOptions;
