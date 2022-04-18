import {BACKEND_URL} from "config";
import {API, Billing} from "./feathers.types";

const configureBilling = (api: API) => {
    // Billing is a custom 'service', since it doesn't have a proper Feathers service on the Backend.
    // Basically, just some bindings over `fetch`.
    const billing: Billing = {
        async getConfig() {
            const jwt = api.getRawToken();

            const result = await fetch(`${BACKEND_URL}/billing/get-config`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${jwt}`
                }
            });

            const data = await result.json();

            if (data.error) {
                throw new Error(data.error?.message);
            } else {
                return data;
            }
        },
        async createCheckoutSession(priceId: string) {
            const jwt = api.getRawToken();

            const result = await fetch(`${BACKEND_URL}/billing/create-checkout-session`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({priceId})
            });

            const data = await result.json();

            if (data.error) {
                throw new Error(data.error?.message);
            } else {
                return data;
            }
        },
        async createCustomerPortalSession() {
            const jwt = api.getRawToken();

            const result = await fetch(`${BACKEND_URL}/billing/create-customer-portal-session`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await result.json();

            if (data.error) {
                throw new Error(data.error?.message);
            } else {
                return data;
            }
        }
    };

    api.billing = billing;
};

export default configureBilling;
