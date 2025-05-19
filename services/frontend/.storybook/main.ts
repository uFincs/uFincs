import type {StorybookConfig} from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-onboarding",
        "@storybook/addon-interactions",
        "@storybook/addon-a11y",
        "@storybook/addon-links"
    ],
    core: {
        disableTelemetry: true,
        disableWhatsNewNotifications: true
    },
    framework: {
        name: "@storybook/react-vite",
        options: {}
    }
};
export default config;
