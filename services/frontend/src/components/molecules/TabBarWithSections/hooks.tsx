import React, {useMemo, useState} from "react";
import {animated, to as interpolate, useSpring} from "react-spring";
import {useDrag} from "react-use-gesture";
import {Tab} from "components/molecules/TabBar/TabBar";
import {useStepTransition} from "hooks/";
import {MathUtils} from "services/";

const SWIPE_DISTANCE = 100;

export interface TabForSection extends Tab {
    /** Make the ID attributes mandatory. This is because we _are_ using the sections,
     *  whereas the original `TabBar` _wasn't_, but left the option open. */
    labelId: string;
    controlsId: string;
}

const useSwipeToChangeTabs = (
    activeTab: number,
    totalTabs: number,
    setActiveTab: (tab: number) => void
) => {
    const [{x}, set] = useSpring(() => ({x: 0}));

    const bind = useDrag(
        ({dragging, direction: [xDirection], down, movement: [mx], vxvy: [_, vy]}) => {
            const direction = xDirection < 0 ? -1 : 1;

            // This prevents the user from swiping left if they're on the first tab,
            // and from swiping right if they're on the last tab, so that they can't
            // swipe past the start/end.
            if (
                (activeTab === 0 && direction === 1) ||
                (activeTab === totalTabs - 1 && direction === -1)
            ) {
                return;
            }

            const isSwiped = Math.abs(mx) > SWIPE_DISTANCE && !dragging;

            if (isSwiped) {
                const nextTab =
                    // The swiping direction is 'reversed';
                    // swiping left moves to the next tab, swiping right moves to the previous tab.
                    direction === -1
                        ? MathUtils.incrementWithBound(activeTab, totalTabs - 1)
                        : MathUtils.decrementWithBound(activeTab, 0);

                setActiveTab(nextTab);
                set({x: 0});
            }

            // When there isn't significant vertical movement happening, that's when we should
            // register the horizontal swipe movement. Otherwise, if we don't put a threshold on it,
            // then the tab section can just freely swing horizontally while the user tries to swipe
            // down the section (e.g. if the section is a list).
            //
            // This is obviously non-optimal UX, considering most apps don't act that way.
            if (Math.abs(vy) < 0.01) {
                set({x: down ? mx : 0, immediate: down});
            }
        }
    );

    return {x, ...bind()};
};

export const useTabBarWithSections = (
    tabs: Array<TabForSection>,
    children: React.ReactNode,
    // If these aren't present, then the tab state will be controlled internally.
    activeTab?: number,
    setActiveTab?: (index: number) => void
) => {
    // Just some error checking to ensure both `activeTab` and `setActiveTab` are present
    // when externally controlling the component state.
    if (
        ((activeTab !== undefined && setActiveTab === undefined) ||
            (activeTab === undefined && setActiveTab !== undefined)) &&
        !(
            (activeTab !== undefined && setActiveTab !== undefined) ||
            (activeTab === undefined && setActiveTab === undefined)
        )
    ) {
        throw new Error(
            "Both 'activeTab' and 'setActiveTab' must be specified when controlling the 'TabBarWithSections'."
        );
    }

    const [internalActiveTab, internalSetActiveTab] = useState(0);

    const actualActiveTab = activeTab !== undefined ? activeTab : internalActiveTab;
    const actualSetActiveTab = setActiveTab !== undefined ? setActiveTab : internalSetActiveTab;

    const childrenArray = React.Children.toArray(children);
    const childrenLength = childrenArray.length;

    if (tabs.length !== childrenLength) {
        throw new Error(
            `Received ${tabs.length} tabs but ${childrenLength} children; they must be equal.`
        );
    }

    const transition = useStepTransition(actualActiveTab);

    const {x: swipeX, ...swipeProps} = useSwipeToChangeTabs(
        actualActiveTab,
        tabs.length,
        actualSetActiveTab
    );

    const sections = useMemo(
        () =>
            transition((style, activeTab) => {
                const {x: transitionX, ...otherStyles} = style;

                const transform = interpolate([swipeX, transitionX], (swipeX, transitionX) => {
                    // Yeah, if `useStepTransition` stops using percentages under the hood, then
                    // this'll need to be changed.
                    if (transitionX !== "0%") {
                        // Combine the swipe amount with the transition amount so that the tab section
                        // animates away to the next tab from the same position that the user left it,
                        // instead of resetting to 0.
                        return `translateX(calc(${transitionX} + ${swipeX}px))`;
                    } else {
                        // If the transition hasn't been triggered yet, then use just the swipe amount.
                        return `translateX(${swipeX}px)`;
                    }
                });

                return (
                    <animated.section
                        key={tabs[activeTab].label}
                        id={tabs[activeTab].controlsId}
                        role="tabpanel"
                        aria-labelledby={tabs[activeTab].labelId}
                        style={{...otherStyles, transform} as any}
                        {...swipeProps}
                    >
                        {childrenArray?.[activeTab]}
                    </animated.section>
                );
            }),
        [childrenArray, swipeProps, swipeX, tabs, transition]
    );

    return {activeTab: actualActiveTab, sections, setActiveTab: actualSetActiveTab};
};
