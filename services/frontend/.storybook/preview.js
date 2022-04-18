import {withKnobs} from "@storybook/addon-knobs";
import {INITIAL_VIEWPORTS} from "@storybook/addon-viewport";
import StoryRouter from "./storyRouterDecorator";
import enhanceKeyboardNavigation from "../src/utils/enhanceKeyboardNavigation";
import enhanceTouchSupport from "../src/utils/enhanceTouchSupport";
import colors from "../src/styles/_colors.module.scss";
import {withConnectedRouter, withStore} from "./decorators";
import "./preview.scss";

const customViewports = {
    ...INITIAL_VIEWPORTS,
    iphone6L: {
        name: "iPhone 6 (Landscape)",
        styles: {
            height: "375px",
            width: "667px"
        }
    }
};

enhanceKeyboardNavigation();
enhanceTouchSupport();

export const parameters = {
    a11y: {
        element: "#root",
        config: {},
        options: {},
        manual: false
    },
    backgrounds: {
        default: "Neutral",
        values: [
            {name: "Neutral", value: colors.colorBackgroundNeutral},
            {name: "Dark", value: colors.colorBackgroundDark},
            {name: "Light", value: colors.colorBackgroundLight}
        ]
    },
    options: {
        // Taken from https://storybook.js.org/docs/configurations/options-parameter/#sorting-stories.
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, {numeric: true})
    },
    viewport: {
        viewports: customViewports
    }
};

export const decorators = [
    withKnobs({escapeHTML: false}),
    StoryRouter(),
    withConnectedRouter,
    withStore
];
