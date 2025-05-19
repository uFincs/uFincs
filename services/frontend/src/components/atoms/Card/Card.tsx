import classNames from "classnames";
import * as React from "react";
import "./Card.scss";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/** A container component that looks like a card. Really, it's just a container with some
 *  border radius. */
const Card = ({className, children, ...otherProps}: CardProps) => (
    <div className={classNames("Card", className)} {...otherProps}>
        {children}
    </div>
);

export default Card;
