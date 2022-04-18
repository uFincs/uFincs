const replace = require("replace-in-file");

// This is a hacky workaround taken from https://github.com/pmndrs/react-spring/issues/1078#issuecomment-713444083.
//
// Basically, it seems like `react-spring` broke with the upgrade to CRA v4 because of something in Webpack v5.
// As a result, the error "TypeError: r.willAdvance is not a function" shows up and all react-spring animations
// are broken.
//
// To fix this, apparently the `sideEffects` flag in all of the react-spring package.json files has to be
// changed from false to true. Why? I don't quite understand. But this script does replacement.
//
// This should be fixed as part of react-spring@9.0.0-rc.4 (we are currently on rc.3),
// but it doesn't seem like much if any progress has been made on it, so I'm not holding my breathe for it.

const removeAllSideEffectsFalseFromReactSpringPackages = async () => {
    try {
        await replace({
            files: "node_modules/@react-spring/*/package.json",
            from: "\"sideEffects\": false",
            to: "\"sideEffects\": true"
        });
    } catch (e) {
        console.log(
            "error while trying to remove string \"sideEffects:false\" from react-spring packages",
            e
        );
    }
};

removeAllSideEffectsFalseFromReactSpringPackages();
