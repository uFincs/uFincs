// All of these values were determined experimentally so that the animation of the
// list items would look as natural as possible, while still being fairly fast.
//
// This article was a good reference:
// https://uxdesign.cc/the-ultimate-guide-to-proper-use-of-animation-in-ux-10bd98614fa9?gi=13c9c66c3047
const BASE_DELAY = 5;
const DURATION = 225;

export type IndexCalculator = (newItemCount?: number) => number;

type ListGenerator = (
    indexCalculator: IndexCalculator
) => Array<JSX.Element | Array<JSX.Element | null | undefined>>;

const calculateAnimation = (index: number) => ({
    animationDelay: `${BASE_DELAY * index}ms`,
    animationDuration: `${DURATION}ms`
});

export const generateAnimatedList = (listGenerator: ListGenerator) => {
    // Start the index at 1 so that even the first (0th) element has to animate in.
    let animationIndex = 1;

    const indexCalculator = (newItemCount: number = 1) => {
        const currentIndex = animationIndex;
        animationIndex += newItemCount;

        // We want the index of the _current_ set of elements, not the next set that has
        // already been calculated into animationIndex.
        return currentIndex;
    };

    return listGenerator(indexCalculator);
};

export const generateAnimationCalculator =
    (animationIndex: number) =>
    (offset: number = 0) =>
        calculateAnimation(animationIndex + offset);
