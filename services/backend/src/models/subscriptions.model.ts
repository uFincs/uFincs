import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {subscriptionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {SUBSCRIPTIONS, USERS} = tableNames;

export class Subscription extends Model {
    public id!: string;
    public customerId!: string | null;
    public productId!: string | null;
    public priceId!: string | null;
    public subscriptionId!: string | null;
    public status!: "active" | "inactive" | "expired";

    public periodStart!: Date | null;
    public periodEnd!: Date | null;
    public isLifetime!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    public userId?: string;

    public static app?: Application;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static async findByUserId(userId: string): Promise<Subscription | undefined> {
        const existingSubscriptions = await Subscription.app?.service("subscriptions").find({
            query: {
                userId
            }
        });

        if (!existingSubscriptions) {
            return;
        }

        const existingSubscription =
            "length" in existingSubscriptions
                ? existingSubscriptions?.[0]
                : existingSubscriptions.data?.[0];

        return existingSubscription;
    }

    public static isActive(subscription: Subscription | undefined): boolean {
        return subscription?.status === "active";
    }

    public static isPastEnd(subscription: Subscription): boolean {
        return subscription.periodEnd
            ? Date.now() > new Date(subscription.periodEnd).getTime()
            : false;
    }

    public static async updateStatus(subscription: Subscription) {
        const isPastEnd = Subscription.isPastEnd(subscription);

        if (isPastEnd && subscription.status === "active" && !subscription.isLifetime) {
            return await Subscription.app?.service("subscriptions")?.patch(subscription.id, {
                status: "expired"
            });
        }

        return subscription;
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    Subscription.app = app;

    Subscription.init(subscriptionsSchema, {
        sequelize,
        name: {
            singular: "Subscription",
            plural: "Subscriptions"
        },
        tableName: SUBSCRIPTIONS,
        // Enabling `paranoid` mode means that subscriptions will be soft-deleted when they are removed.
        // AKA, `deletedAt` will be updated with a value and the subscription won't show up in searches.
        // We want to only soft-delete for auditing purposes.
        paranoid: true,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    Subscription.associate = (models) => {
        Subscription.belongsTo(models.User, {foreignKey: foreignKeys[SUBSCRIPTIONS][USERS].key});
    };

    return Subscription;
}
