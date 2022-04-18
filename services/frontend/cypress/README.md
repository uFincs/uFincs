# Cypress Tests

These are all of the end-to-end (e2e) Cypress tests. These are _crucial_ to the reliability of uFincs: every even slightly sizeable feature gets some sort of e2e testing, along with bug fixes.

e2e testing (for better or worse) makes up the bulk of uFincs testing suite. Alongside unit testing for core business logic and Storybook stories as a form of testing for React components, it is a core part of ensuring uFincs' continued functionality.

For uFincs, e2e testing takes over the role of much of what might have been integration-level testing or unit-level testing for React components. Why? Mostly because I don't find component-level tests to be especially useful, rather preferring to just throw an e2e test at something to be confident that "yes, this feature works".

Cypress test files are split up by feature area (e.g. accounts, transactions, etc). Additionally, within each test file, each feature area is broken down by describe block. These top-level describe blocks are especially important and not just for the usual reason of good coding practices: each block is used as the individual unit for our custom parallelized Cypress runner. Which is to say, when running Cypress tests in parallel, each block becomes a unit of work for the parallel workers to test on. So, more blocks === faster tests (to a point). At some point, the overhead for a unit overcomes the savings of parallelization, but I've found the current block size of ~5-10 tests to be pretty good (I have a blog post about this that I've yet to publish, so I'll link it here if I ever do).

## Running Cypress Tests (Serially)

In order to run the Cypress test suite (serially), first install the Cypress packages. For convenience, all packages required for the Cypress tests are actually all of the non-dev dependencies for the Frontend. You can grab these with:

```
npm ci
```

Then, run the following Make commands from the repo's root Makefile (in separate terminals):

1. `make start` (or `make start-no-storybook`)
2. `make run-frontend-cypress`

This will run the Cypress tests in headless mode. It will take over an hour to run the entire test suite this way.

Note: `make run-frontend-cypress` will likely throw errors about other stuff you need to install on your system for it to work (e.g. `Xvfb`). Just install whatever it needs until it stops complaining (or just follow [their guide](https://docs.cypress.io/guides/continuous-integration/introduction#Dependencies)).

Note: While the vast majority of the uFincs development experience uses Docker, Cypress is the one thing I didn't bother Dockerizing (since I never bothered incoporating it into any of the GCP infrastructure — CI/CD or otherwise). Hence having to actually install the npm/system deps locally.

If you want to run Cypress in interactive mode, instead run:

```
make open-frontend-cypress
```

Note: I've run into issues when running a particularly large number of tests in interactive mode; Chrome will eventually just crash for some reason. As such, I suggest only using interactive mode for developing/debugging individual tests, and using headless mode for

## Running Cypress Tests (In Parallel)

Because the Cypress tests take forever to run serially (1+ hours, as stated above), I decided to hack my way to running the tests in parallel. Technically, Cypress kinda supports this, but it's only for running across multiple machines (orchestrated by their hosted dashboard). I, however, wanted to run tests in parallel on my own machine. Hence, the following monstrosity.

First, you need `tmux` installed. Yes, we parallelize things using tmux. I did say it was hacky.

Second, you need to have a _very_ beefy computer. This particular setup (the default) uses 16 instances. It uses nearly _60GB_ of RAM and almost 100% of a _5900x_ at peak load. Yes, I literally bought 64GB of RAM _just_ to run more of these instances.

Then, in one tmux window, run the following root Make command:

```
make start-cypress-parallel
```

This should create 16 tmux panes. In each pane, a completely indepdent copy of _the entire uFincs stack_ will be started using Docker. That is to say, each pane will be running a copy of the uFincs Backend, Backend Database, Frontend, and Marketing site.

I'm sure you're starting to understand why this takes so much RAM.

Then, to actually run the Cypress tests, run the following in a second tmux window:

```
make run-frontend-cypress-parallel
```

This will open 16 tmux panes, where each pane will be an instance of Cypress. Each Cypress instance will be mapped back to one of the 16 uFincs instances, making it so each instance is perfectly separated and run its tests without any trouble whatsoever (mostly).

Under the hood, the `describe` blocks in each test file will be split apart and put into a queue for each Cypress instance to pull from. This is what enables this great parallelization.

Performance wise, this 16 instance config should take just about 5 minutes to run completely (up to 10 on a bad day).

Now, of course, reading through all of the logs of 16 separate tmux panes would be a pane to figure out if any tests failed. As such, all Cypress instances conveniently dump their logs into a `.cypress-logs` file in the `frontend` service folder for perusal.

Like I said, this setup is pretty hacky. But it works! (most of the time...) Additionally, you can always tweak the relevant scripts to use less than 16 instances if you don't happen to have a baller computer; I've found that even 8 instances is enough to get things down to 15 or 20 minutes.

## False Positives

As is the case with almost all e2e testing solutions, there are definitely some test cases in our test suite that are more prone to false positives. However, they can generally be ignored. Why? Because the vast majority of our tests come in pairs: each test is run once for desktop and once for mobile. If a test only fails for one but passes the other, then it's (almost certainly) fine. So, just ignore them (there's only a couple of them anyways). Or fix them. Have fun.
