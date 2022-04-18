const billingRoute = "/billing";

const customRoutes = {
    billing: {
        getConfig: `${billingRoute}/get-config`,
        createCheckoutSession: `${billingRoute}/create-checkout-session`,
        createCustomerPortalSession: `${billingRoute}/create-customer-portal-session`,
        webhook: `${billingRoute}/webhook`
    }
};

export default customRoutes;
