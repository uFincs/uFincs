const {getJestConfig} = require("@storybook/test-runner");

// How to configure Jest for Storybook smoke tests courtesy of https://github.com/storybookjs/test-runner/issues/300#issuecomment-1665622195.

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
    // The default configuration comes from @storybook/test-runner
    ...getJestConfig(),
    /** Add your own overrides below
     * @see https://jestjs.io/docs/configuration
     */
    testTimeout: 30000
};
