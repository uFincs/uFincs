const fs = require("fs");
const prompts = require("prompts");
const Stripe = require("stripe");

const setupAccount = async (key) => {
    const stripe = new Stripe(key, {apiVersion: "2020-08-27"});

    // Create products
    const standardProduct = await stripe.products.create({name: "Standard"});
    const lifetimeProduct = await stripe.products.create({name: "Lifetime"});

    // Create prices
    const monthly = await stripe.prices.create({
        product: standardProduct.id,
        currency: "usd",
        unit_amount: 2000,
        recurring: {
            interval: "month",
            interval_count: 1
        }
    });

    const annually = await stripe.prices.create({
        product: standardProduct.id,
        currency: "usd",
        unit_amount: 12000,
        recurring: {
            interval: "year",
            interval_count: 1
        }
    });

    const lifetime = await stripe.prices.create({
        product: lifetimeProduct.id,
        currency: "usd",
        unit_amount: 40000
    });

    // Return the generated IDs so they can be saved in the Feathers config.
    const ids = {
        products: {
            standard: standardProduct.id,
            lifetime: lifetimeProduct.id
        },
        prices: {
            monthly: monthly.id,
            annually: annually.id,
            lifetime: lifetime.id
        }
    };

    return ids;
};

(async () => {
    const response = await prompts([
        {
            type: "text",
            name: "testKey",
            message: "Stripe Test API key:"
        },
        {
            type: "text",
            name: "prodKey",
            message: "Stripe Prod API key:"
        }
    ]);

    const {testKey, prodKey} = response;

    const testIds = await setupAccount(testKey);
    const prodIds = await setupAccount(prodKey);

    // Save the IDs to the Feathers config.
    const config = JSON.parse(fs.readFileSync("./config/default.json"));

    config.billing.stripeConfig = {
        test: testIds,
        production: prodIds
    };

    fs.writeFileSync("./config/default.json", JSON.stringify(config, null, 4));

    console.log("Configured Stripe accounts; updated config/default.json.");
})();
