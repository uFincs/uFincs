import {useEffect, useRef, useState} from "react";
import * as React from "react";

interface DelayedRenderProps {
    /** Whatever it is that should have its rendering delayed. */
    children: React.ReactNode;
}

/** A wrapper component that delays the rendering of its children by a small amount.
 *
 *  This is useful to delay the rendering of large, expensive components so that they render
 *  after everything else on a page has been rendered. This enables faster page switching,
 *  which in turn improves the perceived performance of the app. */
const DelayedRender = ({children}: DelayedRenderProps) => {
    const mountedRef = useRef(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        mountedRef.current = true;

        setTimeout(() => {
            // The mounted ref is just a guard so that we don't trigger renders
            // on unmounted components.
            if (mountedRef.current) {
                setVisible(true);
            }
        }, 50);

        return () => {
            mountedRef.current = false;
        };
    });

    return visible ? <>{children}</> : null;
};

export default DelayedRender;
