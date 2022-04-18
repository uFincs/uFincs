import {
    breakpointMedium,
    breakpointNavigationChange,
    breakpointAccountDetailsDoubleColumn,
    mediaQueryProperty
} from "styles/_media_queries.module.scss";

export const mediumBreakpointMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointMedium})`).matches;

export const navigationBreakpointMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointNavigationChange})`).matches;

export const accountDetailsDoubleColumnMatches = () =>
    window.matchMedia(`(${mediaQueryProperty}: ${breakpointAccountDetailsDoubleColumn})`).matches;
