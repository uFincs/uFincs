import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {feedbackSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {FEEDBACK, USERS} = tableNames;

export class Feedback extends Model {
    public id!: string;
    public message!: string;
    public type!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public userId?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static validate(feedback: Partial<Feedback>) {
        const {message} = feedback;

        if (!message) {
            throw new Error("Missing message");
        }
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    Feedback.init(feedbackSchema, {
        sequelize,
        name: {
            singular: "Feedback",
            plural: "Feedback"
        },
        tableName: FEEDBACK,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    Feedback.associate = (models) => {
        Feedback.belongsTo(models.User, {foreignKey: foreignKeys[FEEDBACK][USERS].key});
    };

    return Feedback;
}
