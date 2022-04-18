const Stripe = require("stripe");

const BASE_URL = "backend.ufincs.com/billing/webhook";

const args = process.argv.slice(2);

const namespace = args[0];
const key = args[1];

(async () => {
    const stripe = new Stripe(key, {apiVersion: "2020-08-27"});
    const webhooks = await stripe.webhookEndpoints.list();

    for (const webhook of webhooks.data) {
        // By always checking that the namespace is prefixed, we'll make sure not to accidentally
        // delete the production webhook (i.e. from the `master` branch).
        if (webhook.url === `https://${namespace}.${BASE_URL}`) {
            await stripe.webhookEndpoints.del(webhook.id);
            console.log(`Deleted webhook ${webhook.url}`);
        }
    }
})();