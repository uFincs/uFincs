module.exports = {
    stories: ["../src/**/*.stories.*"],
    addons: [
        "@storybook/preset-create-react-app",
        "@storybook/addon-links",
        "@storybook/addon-knobs",
        "@storybook/addon-actions",
        "@storybook/addon-a11y",
        {
            name: "@storybook/addon-storysource",
            options: {
                loaderOptions: {
                    parser: "typescript",
                    prettierConfig: {
                        arrowParens: "always",
                        bracketSpacing: false,
                        printWidth: 100,
                        singleQuote: false
                    }
                }
            }
        },
        "@storybook/addon-essentials"
    ],
    webpackFinal: (config) => {
        // Add the story-description-loader so that the Docs addon can pick up
        // JSDoc comments on stories as description.
        config.module.rules.push({
            test: /\.stories\.tsx/,
            use: [
                {
                    loader: "story-description-loader",
                    options: {isTSX: true}
                }
            ]
        });

        return config;
    }
};
