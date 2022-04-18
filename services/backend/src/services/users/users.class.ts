import {Request, Response} from "express";
import {Service, SequelizeServiceOptions} from "feathers-sequelize";
import {Application} from "declarations";

export class Users extends Service {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
        super(options);
    }
}

// Just a function to enable internal notifications when users enter no-account mode on the Frontend.
export const noAccountNotification = (app: Application) => (req: Request, res: Response) => {
    app.service("internalNotifier")
        .create({
            message: "A user just entered no-account mode!"
        })
        .then(() => {
            res.send("1");
        });
};
