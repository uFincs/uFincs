import useScrollPosition from "./useScrollPosition";

// This value must correspond to $header-height in styles/_dimens.scss.
const HEADER_HEIGHT = 64;

/* By default, the form slides in just under the app header; however, as the user scrolls,
 * we want the form to move up to cover the space that the header no longer occupies.
 * We use the scroll position to offset the positioning of the form as the user scrolls. */
const calculateTopOffset = (position: number): number =>
    position <= HEADER_HEIGHT ? HEADER_HEIGHT - position : 0;

const useHeaderOffsetPosition = (isActive: boolean = true): number => {
    const scrollPosition = useScrollPosition({isActive});

    return calculateTopOffset(scrollPosition);
};

export default useHeaderOffsetPosition;
