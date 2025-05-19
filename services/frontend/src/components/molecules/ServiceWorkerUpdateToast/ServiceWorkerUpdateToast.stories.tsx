import type {Meta, StoryObj} from "@storybook/react";
import ServiceWorkerUpdateToast from "./ServiceWorkerUpdateToast";

const meta: Meta<typeof ServiceWorkerUpdateToast> = {
    title: "Molecules/Service Worker Update Toast",
    component: ServiceWorkerUpdateToast,
    args: {
        message: "A new version is available"
    }
};

export default meta;
type Story = StoryObj<typeof ServiceWorkerUpdateToast>;

/** The default view of `ServiceWorkerUpdateToast`. */
export const Default: Story = {};
