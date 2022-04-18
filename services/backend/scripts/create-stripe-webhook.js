const Stripe = require("stripe");

const BASE_URL = "backend.ufincs.com/billing/webhook";

const args = process.argv.slice(2);

const namespace = args[0];
const testKey = args[1];
const prodKey = args[2];

let key = testKey;

// When running in production (i.e. the master branch),
// we need to use the prod key to access the right account.
if (namespace === "master") {
    key = prodKey;
}

(async () => {
    const stripe = new Stripe(key, {apiVersion: "2020-08-27"});

    const webhook = await stripe.webhookEndpoints.create({
        url: namespace === "master" ? `https://${BASE_URL}` : `https://${namespace}.${BASE_URL}`,
        enabled_events: [
            "checkout.session.completed",
            "invoice.paid",
            "invoice.payment_failed",
            "customer.subscription.deleted"
        ]
    });

    // Output the secret so that another script can operate on it.
    console.log(webhook.secret);
})();
