import {INITIAL_VIEWPORTS} from "@storybook/addon-viewport";
import type {Preview} from "@storybook/react";
import enhanceKeyboardNavigation from "../src/utils/enhanceKeyboardNavigation";
import enhanceTouchSupport from "../src/utils/enhanceTouchSupport";
import {colors} from "../src/utils/styles";
import {withConnectedRouter, withStore, withRouter} from "./decorators";
import "./preview.scss";

enhanceKeyboardNavigation();
enhanceTouchSupport();

const preview: Preview = {
    decorators: [withRouter, withConnectedRouter, withStore],
    parameters: {
        a11y: {
            element: "#root",
            config: {},
            options: {},
            manual: false
        },
        actions: {argTypesRegex: "^on.*"},
        backgrounds: {
            default: "Neutral",
            values: [
                {name: "Neutral", value: colors.colorBackgroundNeutral},
                {name: "Dark", value: colors.colorBackgroundDark},
                {name: "Light", value: colors.colorBackgroundLight}
            ]
        },
        viewport: {
            viewports: {
                ...INITIAL_VIEWPORTS,
                iphone6L: {
                    name: "iPhone 6 (Landscape)",
                    styles: {
                        height: "375px",
                        width: "667px"
                    }
                }
            }
        }
    }
};

export default preview;
