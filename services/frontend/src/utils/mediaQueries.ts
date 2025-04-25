import {mediaQueries} from "utils/styles";

const {
    breakpointAccountDetailsDoubleColumn,
    breakpointMedium,
    breakpointNavigationChange,
    mediaQueryProperty
} = mediaQueries;

export const mediumBreakpointMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointMedium})`).matches;

export const navigationBreakpointMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointNavigationChange})`).matches;

export const accountDetailsDoubleColumnMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointAccountDetailsDoubleColumn})`).matches;
