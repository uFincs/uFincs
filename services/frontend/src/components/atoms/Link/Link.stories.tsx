import React from "react";
import Link from "./Link";

export default {
    title: "Atoms/Link",
    component: Link
};

/** What a regular `Link` looks like. */
export const Default = () => <Link to="/login">Login</Link>;

/** A `Link` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <Link className="Element--story-FocusOutline" to="/login">
        Login
    </Link>
);
