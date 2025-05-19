/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly REACT_APP_BRANCH: string;
    readonly REACT_APP_BACKEND_HOST: string;
    readonly REACT_APP_BACKEND_PORT: string;
    readonly REACT_APP_BACKEND_PROTOCOL: string;
    readonly REACT_APP_MARKETING_HOST: string;
    readonly REACT_APP_MARKETING_PORT: string;
    readonly REACT_APP_MARKETING_PROTOCOL: string;
    readonly REACT_APP_SOFTWARE_TAG: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
