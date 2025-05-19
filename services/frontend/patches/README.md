# patch-package

This folder contains patches for various packages.

## react-hook-form

In order for the types of the last version of react-hook-form v6 to work properly with `moduleResolution: bundler` in TypeScript, need to patch its `package.json` to export the types correctly.

Note: The patch needs to be generated/updated using `npx patch-package react-hook-form --exclude 'nothing'` since `patch-package` normally ignores `package.json`. Ref: https://github.com/ds300/patch-package/issues/49
