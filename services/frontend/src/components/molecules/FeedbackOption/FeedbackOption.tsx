import classNames from "classnames";
import React from "react";
import {ErrorIcon, LightBulbIcon, OverflowHorizontalIcon} from "assets/icons";
import {Feedback, FeedbackType} from "models/";
import "./FeedbackOption.scss";

const Icons = {
    [Feedback.ISSUE]: <ErrorIcon />,
    [Feedback.IDEA]: <LightBulbIcon />,
    [Feedback.OTHER]: <OverflowHorizontalIcon />
};

const TOOLTIPS = {
    [Feedback.ISSUE]: "You encountered a bug/problem",
    [Feedback.IDEA]: "You have an idea for improving your experience",
    [Feedback.OTHER]: "You just want to sound off"
};

interface FeedbackOptionProps {
    /** Custom class name. */
    className?: string;

    /** The type of issue this option represents. */
    type: FeedbackType;

    /** Handler for when the option gets selected. */
    onSelected: (type: FeedbackType) => void;
}

/** An option that enables users to pick a type of feedback. */
const FeedbackOption = ({className, type, onSelected}: FeedbackOptionProps) => (
    <button
        className={classNames("FeedbackOption", `FeedbackOption--${type}`, className)}
        title={TOOLTIPS[type]}
        onClick={() => onSelected(type)}
    >
        <div className="FeedbackOption-icon-container">{Icons[type]}</div>
        <p className="FeedbackOption-type">{type}</p>
    </button>
);

export default FeedbackOption;
