import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import {Id, NonFunctionProperties} from "utils/types";

export enum FeedbackType {
    issue = "issue",
    idea = "idea",
    other = "other"
}

export interface FeedbackData extends NonFunctionProperties<Feedback> {}

interface FeedbackConstructor extends Omit<Feedback, "createdAt" | "updatedAt"> {
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default class Feedback {
    id: Id;
    isAnonymous: boolean;
    message: string;
    type: FeedbackType;

    createdAt: string;
    updatedAt: string;

    static FEEDBACK_TYPES = Object.values(FeedbackType);
    static ISSUE = FeedbackType.issue;
    static IDEA = FeedbackType.idea;
    static OTHER = FeedbackType.other;

    constructor({
        id = uuidv4(),
        isAnonymous = false,
        message = "",
        type = FeedbackType.issue,
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<FeedbackConstructor> = {}) {
        this.id = id;
        this.isAnonymous = isAnonymous;
        this.message = message;
        this.type = type;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);
    }

    validate(): Feedback {
        const {message} = this;

        if (!message) {
            throw new Error("Missing message");
        }

        return this;
    }
}
