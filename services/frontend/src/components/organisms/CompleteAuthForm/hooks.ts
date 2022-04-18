import {useRef, useState} from "react";
import {AuthType} from "components/molecules/AuthForm";
import {mediumBreakpointMatches} from "utils/mediaQueries";
import {completeAuthFormSmallAnimationTime as smallAnimationTime} from "utils/parsedStyles";

/** This hook handles some overhead for properly animating the switching between the
 *  Login and Sign Up forms.
 *
 *  There are two types of animation that apply to the CompleteAuthForm: the small animation and
 *  the medium animation (small and medium referring to the breakpoints that each animation
 *  applies to).
 *
 *  At the medium breakpoint, the CompleteAuthForm is laid out so that the AlternativeAuthForm
 *  is a larger square side-by-side with the AuthForm. The medium animation, thus, is
 *  the switching of the positions of the two forms. This is more-or-less handled entirely in CSS.
 *
 *  However, the small animation, when the CompleteAuthForm is stacked vertically with the
 *  AlternativeAuthForm beneath the AuthForm, is a bit more complicated. The small animation here
 *  is translating the entire form off one side of the screen and having the other form type
 *  slide in from the other side of the screen.
 *
 *  We needed some custom JavaScript and CSS classes to pull this off. First off all, the existence
 *  of the "CompleteAuthForm--small-login-animation" and the
 *  "CompleteAuthForm--small-signup-animation" is what's needed to be able properly animate
 *  the form at all. Secondly, the fact that there are two classes (one for each auth type)
 *  is what enables having the form slide off the screen in both directions.
 *
 *  I found that, with only CSS, I couldn't get the sliding animation to just trigger
 *  whenever the user clicked the alternative auth button; therefore, I had to resort to
 *  toggling a class on and off the form.
 *
 *  Then, to get the different sliding directions, I needed one class for each type to designate
 *  when the form should slide off in each direction.
 *
 *  So now, what happens is that the user clicks the alt auth button. Then one of the above
 *  small animation classes is applied. This triggers the sliding animation. Once the animation is
 *  done, the class is then removed with a timeout.
 *
 *  An additional wrinkle to this is that, in order to make the animation look seamlessly like
 *  one form is disappearing and another one is appearing (as opposed to a single form that's
 *  transforming between the two), we had to delay the change in auth `type`. This is accomplished
 *  by delaying the `onAltClick` handler from firing until a ways into animation. Otherwise,
 *  the `type` prop would change immediately, and the user would see the alternative form
 *  type slide off the screen and then reappear. Not the greatest UX.
 */
export const useAlternativeFormAnimation = (
    type: AuthType,
    onAltClick: (data: React.MouseEvent) => void
) => {
    // hasAltBeenClicked is used animation-wise for the medium animation so that the transform
    // animation doesn't trigger on page load (i.e. before the alt button has been clicked).
    const [hasAltBeenClicked, setHasAltBeenClicked] = useState(false);

    // smallAnimationType designates which type of small animation needs to happen.
    const [smallAnimationType, setSmallAnimationType] = useState<AuthType | "">("");

    // Use some refs to hold reference to the timers that trigger the small animations
    // and change the type. This way, we can clear the timers before trying to set them again.
    // We want to do this to account for when users try spam clicking the alt click button:
    // by ensuring the timeouts get cleared before creating new ones, there won't be any
    // inconsistent behaviour of old timers firing after new ones.
    const typeChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationTypeChangeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const finalOnAltClick = (e: React.MouseEvent) => {
        if (!hasAltBeenClicked) {
            setHasAltBeenClicked(true);
        }

        if (mediumBreakpointMatches()) {
            // Just fire the click handler when the screen size is big enough.
            // The medium switching animation is handled all in CSS.
            onAltClick(e);
        } else {
            // Start the small switching animation.
            setSmallAnimationType(type);

            // Clear out any existing timers that might not have fired yet so that they don't
            // potentially overlap with any new ones.
            if (typeChangeTimer.current) {
                clearTimeout(typeChangeTimer.current);
            }

            if (animationTypeChangeTimer.current) {
                clearTimeout(animationTypeChangeTimer.current);
            }

            // We want the actual click handler to fire a bit into the switching animation
            // so that it looks like the first form completely left the screen before the other
            // form type comes in from off the other edge of the screen.
            typeChangeTimer.current = setTimeout(() => {
                onAltClick(e);
                typeChangeTimer.current = null;
            }, smallAnimationTime - 100);

            // We want to clean up the small animation class just a bit after the animation
            // has finished just to give it time _to_ finish; experimentally, I found that
            // setting it to the same amount of as the animation time would cause the
            // animation to abruptly end.
            animationTypeChangeTimer.current = setTimeout(() => {
                setSmallAnimationType("");
                animationTypeChangeTimer.current = null;
            }, smallAnimationTime + 100);
        }
    };

    return {hasAltBeenClicked, smallAnimationType, finalOnAltClick};
};
