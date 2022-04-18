# Capacitor Changelog

The following document is a log of all the _manual_ changes that we have made to any of the Capacitor-generated folders/files.

Currently, this applies to the `android`, `ios`, and `electron` folders.

## Android

UFC-382:

-   Created/modified app icon assets using the Android Studio image asset wizard.

-   Removed the `splash.png` asset from all `app/src/main/res/drawable` folders.

-   Modified `app/src/main/res/values/styles.xml` from:

```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@drawable/splash</item>
</style>
```

to:

```xml
<style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
    <item name="android:background">@null</item>
</style>
```

to remove the splash screen asset.

## iOS

UFC-382:

-   Created app icon assets using `cordova-res`.

## Electron

UFC-382:

-   Modified `src/index.ts` to maximize the window before showing it.

UFC-411:

-   Added the `electron:start` command so that `npm run cap:run:electron` doesn't complain about it being missing.