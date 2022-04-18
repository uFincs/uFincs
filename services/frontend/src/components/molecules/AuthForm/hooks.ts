import {useEffect, useRef} from "react";
import {ReactHookFormRegisterFunction} from "utils/types";
import InputValidation from "values/inputValidation";

/** This enables a UX optimization whereby the user's cursor is focused into the email
 *  input and the password input is cleared when they fail to authenticate.
 */
export const useClearPasswordOnError = (error: string) => {
    const emailRef = useRef<HTMLInputElement>();
    const passwordRef = useRef<HTMLInputElement>();

    useEffect(() => {
        if (error) {
            emailRef?.current?.focus();

            if (passwordRef.current) {
                passwordRef.current.value = "";
            }
        }
    }, [emailRef, error]);

    return {emailRef, passwordRef};
};

/** Combines needing to register the email input with react-hook-form and our own ref. */
export const useRegisterEmailInput =
    (
        register: ReactHookFormRegisterFunction,
        emailRef?: React.MutableRefObject<HTMLInputElement | undefined>
    ) =>
    (e: HTMLInputElement) => {
        if (emailRef) {
            emailRef.current = e;
        }

        register(e, {
            required: "Email is missing",
            pattern: {
                value: InputValidation.emailRegex,
                message: "Email is malformed"
            }
        });
    };

/** Combines needing to register the password input with react-hook-form and our own ref. */
export const useRegisterPasswordInput =
    (
        register: ReactHookFormRegisterFunction,
        passwordRef: React.MutableRefObject<HTMLInputElement | undefined>
    ) =>
    (e: HTMLInputElement) => {
        passwordRef.current = e;
        register(e, {required: "Password is missing"});
    };
