import {ValueConversion} from "services/";
import {animations, borders as rawBorders, fonts, sizes as rawSizes, tables} from "./styles";

export const borders = {
    radiusNormal: ValueConversion.parsePixels(rawBorders.borderRadiusNormal),
    radiusLarge: ValueConversion.parsePixels(rawBorders.borderRadiusNormal)
};

// We might have this coded as a 'variable' in the CSS, but it should really always be 1000ms.
// If the interval _isn't_ 1 second, then all of the calculations are messed up.
// So... don't change it!
export const circularCountDownInterval = ValueConversion.parseMilliseconds(
    animations.circularCountdownInterval
);

export const completeAuthFormSmallAnimationTime = ValueConversion.parseMilliseconds(
    animations.completeAuthFormSmallAnimationTime
);

export const transitionShortLength = ValueConversion.parseMilliseconds(
    animations.transitionShortLength
);

export const fontWeights = {
    normal: parseInt(fonts.fontWeightNormal),
    semibold: parseInt(fonts.fontWeightSemibold),
    bold: parseInt(fonts.fontWeightBold)
};

export const sizes = {
    size50: ValueConversion.parsePixels(rawSizes.size50),
    size100: ValueConversion.parsePixels(rawSizes.size100),
    size200: ValueConversion.parsePixels(rawSizes.size200),
    size300: ValueConversion.parsePixels(rawSizes.size300),
    size400: ValueConversion.parsePixels(rawSizes.size400),
    size500: ValueConversion.parsePixels(rawSizes.size500),
    size600: ValueConversion.parsePixels(rawSizes.size600),
    size700: ValueConversion.parsePixels(rawSizes.size700),
    size800: ValueConversion.parsePixels(rawSizes.size800),
    size900: ValueConversion.parsePixels(rawSizes.size900)
};

export const tabBarSpacing = ValueConversion.parsePixels(rawSizes.sizeTabBarSpacing);

export const transactionsTableLargeWidth = ValueConversion.parsePixels(
    tables.transactionsTableLargeWidth
);
