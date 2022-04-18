import {useEffect, useRef, useState} from "react";

/** Hook that determines whether or not an element should stick to the top of the screen.
 *
 *  That is, it uses the IntersectionObserver API to determine if the top of the given element
 *  has intersected with the top of the viewport.
 *
 *  Inspired by https://stackoverflow.com/a/57991537 and
 *  https://medium.com/the-non-traditional-developer/how-to-use-an-intersectionobserver-in-a-react-hook-9fb061ac6cb5. */
const useStickyToTop = () => {
    const [isSticky, setSticky] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new window.IntersectionObserver(
            // We only want it to be sticky when the top intersects with the browser viewport.
            //
            // If we use something like `intersectionRatio` or `isIntersecting`, then it
            // would also count intersecting with the sides of the viewport.
            //
            // This doesn't work if the element isn't perfectly responsive, cause then it'll
            // try and stick to the top when it intersects with the side.
            ([e]) => setSticky(e.boundingClientRect.top <= 0),
            {threshold: 1}
        );

        const {current: currentObserver} = observer;

        if (containerRef.current) {
            currentObserver.observe(containerRef.current);
        }

        return () => currentObserver.disconnect();
    });

    return {containerRef, isSticky};
};

export default useStickyToTop;
