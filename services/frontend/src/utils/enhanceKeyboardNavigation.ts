import KeyCodes from "values/keyCodes";

/** This keyboard enhancement technique centers around applying a certain class
 *  to the body element when the keyboard is being used to navigate (i.e. using tab),
 *  while removing the class when the mouse is being used to navigate.
 *
 *  This class then enables us to better style individual elements according to whether or not
 *  the user is using keyboard navigation.
 *
 *  Primarily, this means showing custom focus outlines when the user is tabbing through elements,
 *  but _not_ showing focus outlines when the user is clicking on elements.
 *
 *  For reference, I saw Stripe using this technique and here's an SO post demonstrating it:
 *  https://stackoverflow.com/a/51093815. They note that Facebook has also used this technique.
 *
 *  Also for reference, the reason this kind of thing is an app-level utility as opposed to, say,
 *  an app-level hook, is because Storybook needs to be able to use this code. As such,
 *  it needs to be pure JavaScript and not a React hook for it to work in both systems.
 *
 *  Of course, in app land, this function just gets called in a useEffect hook. */
const enhanceKeyboardNavigation = () => {
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.keyCode === KeyCodes.TAB) {
            document.body.classList.add("keyboard-navigation");
        }
    };

    const onMouseDown = (_e: MouseEvent) => {
        document.body.classList.remove("keyboard-navigation");
    };

    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("mousedown", onMouseDown);

    return () => {
        document.body.removeEventListener("keydown", onKeyDown);
        document.body.removeEventListener("mousedown", onMouseDown);
    };
};

export default enhanceKeyboardNavigation;
