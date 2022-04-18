import {CapacitorConfig} from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.ufincs.app",
    appName: "uFincs",
    webDir: "build",
    bundledWebRuntime: false,
    server: {
        allowNavigation: ["*"]
    }

    // Uncomment this to enable live-reload.
    // For Android, need to run `adb reverse tcp:3000 tcp:3000` to port-forward the Frontend server to the emulator.
    //
    // server: {
    //     url: "http://localhost:3000",
    //     cleartext: true
    // }
};

export default config;
