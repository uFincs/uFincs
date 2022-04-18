import {Browser} from "@capacitor/browser";
import {Capacitor} from "@capacitor/core";
import {Storage} from "@capacitor/storage";

type Platform = "android" | "ios" | "web" | "electron";

/** Service that wraps the framework we use (currently Capacitor) for turning the web app into
 *  a mobile/desktop app. */
export default class NativePlatformsService {
    static storage = Storage;

    static getPlatform(): Platform {
        return Capacitor.getPlatform() as Platform;
    }

    static isMobilePlatform(): boolean {
        return Capacitor.isNativePlatform();
    }

    static isAndroid(): boolean {
        return NativePlatformsService.getPlatform() === "android";
    }

    static isIOS(): boolean {
        return NativePlatformsService.getPlatform() === "ios";
    }

    static isWeb(): boolean {
        return NativePlatformsService.getPlatform() === "web";
    }

    static navigateTo(url: string) {
        if (NativePlatformsService.isMobilePlatform()) {
            Browser.open({url});
        } else {
            window.location.href = url;
        }
    }
}
