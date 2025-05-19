import {renderHook} from "@testing-library/react";
import {Provider} from "react-redux";
import {RunResult} from "redux-saga-test-plan";
import {vi} from "vitest";
import configureStore from "store/";

/* Saga Related */

// 10ms; used for timing out sagas with infinite loops when testing them.
// For reference: https://redux-saga-test-plan.jeremyfairbank.com/integration-testing/timeout.html
export const SAGA_TIMEOUT = 10;

// Just wraps a payload with a dummy type so that TypeScript doesn't complain.
export const actionWithDummyType = (payload: any) => ({type: "", payload});

export const actionWithDummyTypeAndError = (payload: any, error = false) => ({
    type: "",
    payload,
    error
});

// Make sure no other actions have been dispatched.
export const noOtherDispatches = (results: RunResult): RunResult => {
    if (results?.effects?.put) {
        expect(results.effects.put?.length).toBe(0);
    } else {
        expect(results.effects.put).toBeUndefined();
    }

    return results;
};

// Silence the console error output if we know there should be an error.
export const silenceConsoleErrors = (): void => {
    console.error = vi.fn();
    console.log = vi.fn();
};

export const expectSagaError = async (sagaTest: Promise<RunResult>): Promise<void> => {
    // Note: For some reason, trying to call 'silenceConsoleErrors' here doesn't always work.
    //
    // But if it's called in the actual test itself, it works fine.
    //
    // ¯\_(ツ)_/¯

    let errorOccurred = true;

    try {
        await sagaTest;
        errorOccurred = false;
    } catch (e) {
        expect(e).toEqual(expect.anything());
    }

    if (!errorOccurred) {
        expect("error should have occurred").toEqual("it did not");
    }
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const provideSelect = <T extends any>(value?: T): {select: () => T | undefined} => ({
    select: () => value
});

/* React Testing Library Related */

export const renderHooksWithRedux = function <Result>(
    hooksCallback: (...args: any[]) => Result,
    {wrapper: Wrapper, options}: Record<string, any>
) {
    // End user tests can access the store using the react-redux hooks.
    // i.e. useDispatch, useState, useSelector, etc.
    const {store} = configureStore();

    const ReduxWrapper = ({children}: any) =>
        Wrapper ? (
            <Provider store={store}>
                <Wrapper>{children}</Wrapper>
            </Provider>
        ) : (
            <Provider store={store}>{children}</Provider>
        );

    return renderHook(hooksCallback, {wrapper: ReduxWrapper, ...options});
};
