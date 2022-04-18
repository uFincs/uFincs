const composePlugins = require("next-compose-plugins");
const withPreact = require("next-plugin-preact");

const withAnalyze = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true"
});

module.exports = composePlugins([withAnalyze, withPreact], {
    async headers() {
        // Note: JS and CSS files automatically have Cache-Control headers added.
        return [
            {
                source: "/(.*).(png|jpg|svg|gif|ico|txt|woff|woff2)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=15552000" // 86400 (seconds in 1 day) * 30 days * 6 months
                    }
                ]
            }
        ];
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: "@svgr/webpack",
                    options: {
                        // Disable SVG optimizations since it seems to strip `stopColor`s
                        // from linear gradients, resulting in colorless SVG graphics.
                        svgo: false
                    }
                }
            ]
        });

        return config;
    },
    publicRuntimeConfig: {
        branch: process.env.BRANCH
    }
});
