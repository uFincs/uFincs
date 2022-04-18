export type Service =
    | "accounts"
    | "authManagement"
    | "featureFlags"
    | "feedback"
    | "importProfiles"
    | "importRules"
    | "preferences"
    | "recurringTransactions"
    | "transactions"
    | "users";

export type ServiceMethod = "find" | "get" | "create" | "update" | "patch" | "remove";

export interface PriceIds {
    monthly: string;
    annually: string;
    lifetime: string;
}

export interface Billing {
    getConfig: () => Promise<{prices: PriceIds}>;
    createCheckoutSession: (priceId: string) => Promise<{sessionId?: string | null}>;
    createCustomerPortalSession: () => Promise<{url?: string}>;
}

export interface API {
    billing: Billing;
    configure: (callback: (api: API) => void) => void;
    service: (service: Service) => Record<ServiceMethod, (...args: any[]) => Promise<any>>;

    // Methods added by the Feathers authentication service
    authenticate: (options: {strategy: "local"; email: string; password: string}) => {user: any};
    logout: () => void;
    reAuthenticate: () => {user: any};
    settings: {authentication?: any};

    // Methods added by ./auth.ts
    getRawToken: () => string;
    setRawToken: (token: string) => void;
    clearToken: () => void;
    getToken: () => {iat: number; exp: number; aud: string; iss: string; sub: string};
    isAuthenticated: () => boolean;
    testPassword: (options: {email: string; password: string}) => Promise<any>;
    notifyNoAccount: () => Promise<void>;
}

export interface Feathers {
    authentication: (...args: any[]) => any;
    rest: (...args: any[]) => any;
    (): API;
}
