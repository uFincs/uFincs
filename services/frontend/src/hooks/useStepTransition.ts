import {useRef} from "react";
import {useTransition} from "react-spring";

/** Creates a transition that can be used when navigating between steps (e.g. for the onboarding process).
 *
 *  The transition changes direction depending on which way the user navigates the steps (next vs back).
 *
 *  Important Note: The return value of this hook is the transition function that is returned from
 *  react-spring v9's `useTransition` hook. For more details on how to use it, see:
 *  https://aleclarson.github.io/react-spring/v9/breaking-changes/#The-sort-prop
 *
 *  What is important to note is that the second argument to the callback that is passed to the transition
 *  function will be the `currentStep` value. This _must_ be used when determining which step to render,
 *  and not whatever reference/value is passed into `useStepTransition` itself.
 *
 *  If this isn't done, then the animations will be screwy, where instead of transitioning from
 *  one step to the next, it'll animate the next step leaving _and_ entering. Probably unnoticeable
 *  to most people, but certainly annoying.
 *
 *  Just to further illustrate, use the transition function like this (e.g. in a render function):
 *
 *  ```
 *  const transition = useStepTransition(currentStep);
 *
 *  return transition((style, currentStep) => {
 *      const Step = STEPS[currentStep];
 *      return <Step style={style} />;
 *  });
 *  ```
 *
 *  And _not_ like this:
 *
 *  ```
 *  const Step = STEPS[currentStep];
 *
 *  const transition = useStepTransition(currentStep);
 *
 *  return transition((style) => (
 *      <Step style={style} />
 *  ));
 *  ```
 */
const useStepTransition = (currentStep: number) => {
    // Need to use an array for the last 'step' to keep a history of the last X steps
    // (in this case, X is arbitrary chosen as 4).
    //
    // This is to hedge against the double rendering that happens when running in React Strict Mode;
    // when the double rendering happens, the 'last step' (if it were a single variable) would get
    // immediately overwritten by the second render, causing the direction calculation to be wrong.
    //
    // As such, by keeping a (short) history of the past 'last steps', we can find the 'true' last step
    // by just finding the last change in the set of steps, and determine the direction off that.
    const lastSteps = useRef<Array<number>>([currentStep]);

    // The direction determines which way the steps enter/leave.
    // When going to the next step, they should enter from the right and leave to the left.
    // When going to the previous step, they should enter from the left and leave to the right.
    const direction = calculateDirection(currentStep, lastSteps.current);

    const transition = useTransition(currentStep, {
        key: currentStep,
        unique: true,
        // This trick of using position: static on from/enter and absolute on leave was taken from
        // https://codesandbox.io/s/18y0pky3z7 which was found from:
        // https://spectrum.chat/react-spring/general/directional-slide-transition~2aa59979-07a7-44db-b12e-0422b7574649.
        // Note: The container of the steps must have position: relative for this to work properly.
        from: {x: `${100 * direction}%`, opacity: 0, position: "static"},
        enter: {x: "0%", opacity: 1, position: "static"},
        leave: {
            // I don't know quite why, but I found I needed a much larger the translation (300) when going
            // in the opposite direction; it just didn't look right at only 100.
            x: direction === 1 ? "-100%" : "300%",
            opacity: 0,
            position: "absolute"
        },
        // Don't animate in the first step.
        initial: null
    });

    lastSteps.current.push(currentStep);

    // Only need to keep a short history of the steps; shift excess entries out just in case.
    if (lastSteps.current.length > 4) {
        lastSteps.current.shift();
    }

    return transition;
};

export default useStepTransition;

/* Helper Functions */

const calculateDirection = (currentStep: number, lastSteps: Array<number>): -1 | 1 => {
    let thing = currentStep;

    for (let i = lastSteps.length - 1; i >= 0; i--) {
        if (lastSteps[i] !== thing) {
            thing = lastSteps[i];
            break;
        }
    }

    return currentStep < thing ? -1 : 1;
};
