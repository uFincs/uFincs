/** See `enhanceKeyboardSupport.ts` for more details on the reason we do this kind of thing.
 *
 *  For touch support in particular, we want to be able to remove certain hover effects so
 *  that they aren't 'sticky' (e.g. tapping a button and having it still have a dark background).
 *
 *  Normally, this would be done with something like @media (hover: hover) {}, however I found
 *  this to inexplicably be broken on Chrome, on my desktop (running Ubuntu 16.04 with Unity).
 *  It just wouldn't register hovers at all using that media query.
 *
 *  As such, we're hacking it! Seems like https://stackoverflow.com/a/19715406 had some good
 *  ideas (seen below) on how to detect touch support, so we're going with that instead. */
const enhanceTouchSupport = () => {
    const hasTouch = !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;

    if (hasTouch) {
        document.body.classList.add("touch-support");
    }
};

export default enhanceTouchSupport;
