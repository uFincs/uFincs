# Common Hooks

These are all of the app-wide custom React hooks that we use. Yes, there's a lot of them. Basically, any time a piece of functionality can be expressed as a hook, and it is shared by more than one component (or even if its just more easily encapsulated as a single hook), it should go in here.

The 'date range' hooks are worth touching on specifically. 'Date Range' state is one of the few (if not only) pieces of app-wide state that _isn't_ in Redux (it uses Context) — honestly, one of the biggest design blunders in the app. Nonetheless, since it's such an important/big piece of the app, there are naturally a large number of hooks based around it (mostly for trying to merge together the Context state with other Redux state).

It should really be refactored into Redux state...
