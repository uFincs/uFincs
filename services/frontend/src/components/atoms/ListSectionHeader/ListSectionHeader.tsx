import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {TextFieldProps} from "components/atoms/TextField";
import "./ListSectionHeader.scss";

interface ListSectionHeaderProps extends TextFieldProps {}

/** A header used for a section in a list. */
const ListSectionHeader = ({className, children, ...otherProps}: ListSectionHeaderProps) => (
    <TextField className={classNames("ListSectionHeader", className)} {...otherProps}>
        {children}
    </TextField>
);

export default ListSectionHeader;
