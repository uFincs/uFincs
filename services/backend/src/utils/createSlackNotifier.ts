import {IncomingWebhook} from "@slack/webhook";

export const createSlackNotifier = (url: string) => new IncomingWebhook(url);
