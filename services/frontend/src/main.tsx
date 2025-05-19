// import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./main.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    // Tech Debt: StrictMode causes react-hook-form to not work properly.
    // For some reason, react-hook-form doesn't recover well from the double render
    // (specifically it thinks its still unmounted after the first unmount) that
    // causes form validation to not work properly, so we disable strict mode for now.
    // <StrictMode>
    <App />
    // </StrictMode>
);
