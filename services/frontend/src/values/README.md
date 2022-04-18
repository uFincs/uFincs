# Values

This folder contains values that are shared and used throughout the app.

Unlike the top-level `config.ts`, which handles pulling 'environment' variables and exposing them to the rest of the app, values in this folder are constant and specific to the app.

NOTE: This folder used to be called `constants`. However, due to what seemed to be a bug in `eslint-plugin-import`, it had to be changed.

For some reason, even when specifiying an explicit regex match of `constants/` for the ESLint `import/internal-regex` setting, the plugin wouldn't treat the imports as an internal module. As such, it would always say to re-order it to the top of the imports list, with the external modules. But it would only do this when the import path started with _exactly_ `constants`. Not `constant`. Not `constantx`. Not `const` -- it would just ignore the regex and treat it as an external module if it was only _exactly_ `constants`. No clue why.

So we took the laziest route to fix it: just rename the folder. `values` seemed to work good enough, so here we are.
