import {action} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {EditIcon} from "assets/icons";
import IconButton from "./IconButton";

export default {
    title: "Atoms/Icon Button",
    component: IconButton
};

const clickAction = () => action("clicked");

/** The default view of an `IconButton`. */
export const Default = () => (
    <IconButton onClick={clickAction()} title="Edit">
        <EditIcon />
    </IconButton>
);

export const DarkBackground = () => (
    <IconButton
        disabled={boolean("Disabled", false)}
        onDarkBackground={true}
        onClick={clickAction()}
        title="Edit"
    >
        <EditIcon />
    </IconButton>
);

// This doesn't seem to work...
DarkBackground.parameters = {
    backgrounds: {
        default: "dark"
    }
};

/** The disabled view of an `IconButton`. Reduces contrast on the icon to indicate disableness. */
export const Disabled = () => (
    <IconButton disabled={boolean("Disabled", true)} onClick={clickAction()} title="Edit">
        <EditIcon />
    </IconButton>
);

/** An `IconButton` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <IconButton className="Element--story-FocusOutline" onClick={clickAction()} title="Edit">
        <EditIcon />
    </IconButton>
);
