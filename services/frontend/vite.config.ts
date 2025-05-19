import os from "os";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import {VitePWA} from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";
import {configDefaults, defineConfig} from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
    css: {
        preprocessorOptions: {
            scss: {
                silenceDeprecations: [
                    // Tech Debt: Should switch to new import Sass import system.
                    // Ref: https://sass-lang.com/documentation/breaking-changes/import/
                    "import",

                    // Tech Debt: Should... change how we handle mixins for nesting?
                    // Ref: https://sass-lang.com/documentation/breaking-changes/mixed-decls/
                    // Ref: https://github.com/sass/dart-sass/issues/2276
                    "mixed-decls"
                ]
            }
        }
    },
    envPrefix: "REACT_APP_",
    resolve: {
        alias: {
            // This is for Sass imports, not TypeScript.
            // TypeScript imports are handled by the `vite-tsconfig-paths` plugin.
            "@": path.resolve(__dirname, "./src")
        }
    },
    plugins: [
        svgr(),
        react(),
        tsconfigPaths(),
        VitePWA({strategies: "injectManifest", srcDir: "src", filename: "service-worker.ts"})
    ],
    server: {
        host: "0.0.0.0",
        port: 3000,
        strictPort: true
    },
    build: {
        outDir: "build" // Match create-react-app's output directory.
    },
    preview: {
        // Keep using port 3000 cause of CORS reasons (Backend only allows port 3000 on localhost).
        port: 3000
    },
    // Vitest config
    test: {
        environment: "jsdom",
        exclude: [...configDefaults.exclude, "cypress/**/*"],
        globals: true,
        maxConcurrency: os.cpus().length,
        setupFiles: ["src/setupTests.ts"],
        testTimeout: 10000
    }
});
