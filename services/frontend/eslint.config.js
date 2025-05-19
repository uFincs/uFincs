import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["build", "cypress/tempIntegration/**/*"]
    },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser
        },
        plugins: {
            import: importPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "react-refresh": reactRefreshPlugin
        },
        settings: {
            "import/internal-regex":
                /api\/.*|assets\/.*|components\/.*|hooks\/.*|models\/.*|scenes\/.*|services\/.*|store\/.*|structures\/.*|styles\/.*|utils\/.*|values\/.*|vendor\/.*|config/,
            react: {
                version: "19.1.0"
            }
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "no-trailing-spaces": ["error"],
            "no-unused-vars": ["off"],
            "max-len": ["error", {code: 120}],
            "no-console": ["off"],
            "no-multiple-empty-lines": ["error", {max: 1}],
            "prefer-const": ["error", {destructuring: "all"}],
            "no-var": ["error"],
            "object-curly-spacing": ["error", "never"],
            "array-bracket-spacing": ["error", "never"],
            "arrow-parens": ["error"],
            "arrow-spacing": ["error"],
            "space-infix-ops": ["error"],
            "no-multi-spaces": ["error", {ignoreEOLComments: true}],
            "keyword-spacing": ["error"],
            "space-unary-ops": ["error"],
            "brace-style": ["error", "1tbs", {allowSingleLine: true}],
            "import/first": ["error"],
            "import/no-anonymous-default-export": "off",
            "import/order": [
                "error",
                {
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: false
                    },
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "ignore"
                }
            ],
            "require-yield": "off",
            "react/jsx-boolean-value": ["error", "always"],
            "react/jsx-closing-bracket-location": "error",
            "react/jsx-curly-spacing": ["error", "never"],
            "react/jsx-equals-spacing": ["error", "never"],
            "react/jsx-indent": ["error", 4],
            "react/jsx-indent-props": ["error", 4],
            "react/jsx-key": "error",
            "react/jsx-max-props-per-line": ["error", {maximum: 4}],
            "react/jsx-no-duplicate-props": ["error", {ignoreCase: true}],
            "react/jsx-no-target-blank": "error",
            "react/jsx-no-undef": "error",
            "react/jsx-pascal-case": "error",
            "react/jsx-tag-spacing": ["error", {beforeSelfClosing: "always"}],
            "react/jsx-uses-vars": "error",
            "react/no-danger": "error",
            "react/no-deprecated": "error",
            "react/no-direct-mutation-state": "error",
            "react/no-children-prop": "error",
            "react/no-is-mounted": "error",
            "react/no-unescaped-entities": "error",
            "react/prefer-es6-class": ["error", "always"],
            "react/prefer-stateless-function": "error",
            "react/require-render-return": "error",
            "react/self-closing-comp": ["error", {component: true, html: false}],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "error",
            "react-refresh/only-export-components": ["warn", {allowConstantExport: true}],
            "@typescript-eslint/no-empty-object-type": "off",
            // Tech Debt: Turn this back on and fix things.
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-redeclare": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ]
        }
    }
);
