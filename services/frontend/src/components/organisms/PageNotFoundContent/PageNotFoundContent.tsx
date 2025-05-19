import classNames from "classnames";
import {EmptyBox} from "assets/graphics";
import {Link, TextField} from "components/atoms";
import "./PageNotFoundContent.scss";

interface PageNotFoundContentProps {
    /** Custom class name. */
    className?: string;

    linkToPlaceThatDoesExist: string;
    placeThatDoesExist: string;
}

/** The content for the 404 page. */
const PageNotFoundContent = ({
    className,
    linkToPlaceThatDoesExist,
    placeThatDoesExist
}: PageNotFoundContentProps) => (
    <div className={classNames("PageNotFoundContent", className)}>
        <EmptyBox className="PageNotFoundContent-graphic" />

        <h2 className="PageNotFoundContent-title">Welp, that page doesn&apos;t exist</h2>

        <TextField className="PageNotFoundContent-message">
            Head to the{" "}
            <Link className="PageNotFoundContent-link" to={linkToPlaceThatDoesExist}>
                {placeThatDoesExist}
            </Link>{" "}
            that does exist, or try double-checking the URL.
        </TextField>
    </div>
);

export default PageNotFoundContent;
