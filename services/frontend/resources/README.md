# Capacitor Resources

This folder exists exclusively because the tool to generate the app icons for Capacitor (called `cordova-res`, https://github.com/ionic-team/cordova-res) requires a folder named `resources`.

## Assets

The following files in this folder are required:

-   icon.png (min 1024x1024px)
-   splash.png (idk, cordova-res recommends 2732x2732px, but it seems like 4800x3200px works, at least for iOS)

## How to generate app icon for Android

`cordova-res` didn't work well for Android. When I tried to generate the app icons for Android, they were all cropped wrong (icons were too big). Now, was that my fault or the tool's fault? We'll never know.

But what I do know is that the image asset generator in Android Studio had a 'resize' option that _did_ work, so I'm saying we should use that instead.

Also, I tried to generate splash screen images, but they were also stretched weirdly. So I just got rid of them by removing all of the `splash.png` assets and changing the `android:background` value to `null` in `android/app/src/main/res/styles.xml` under the `AppTheme.NoActionBarLaunch` item.

Follow the steps at https://developer.android.com/studio/write/image-asset-studio and use `resources/android/icon-foreground.png` as the source image for the Foreground Layer, and just use #FFFFFF as the Background Layer.

Make sure the Foreground Layer tab is the selected tab before clicking `Next` in the wizard, cause it doesn't seem to generate the foreground assets otherwise.

## How to generate app icon for iOS

Seems like `cordova-res` works well for iOS.

You should install `cordova-res` globally: `npm install -g cordova-res`

Then run `cordova-res ios --skip-config --copy`.

This will use the `icon.png` and `splash.png` files to generate all of the necessary assets.

Note: This means that we technically have a splash screen for iOS but not one for Android. Well, Android just uses a default one using the app icon, which is basically what we want anyways, so we should be fine.
