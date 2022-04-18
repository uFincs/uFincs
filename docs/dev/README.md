# uFincs Developer Guide

The following guide will go through how to develop uFincs. It will cover things like how to run uFincs locally for development, coding guidelines, and best practices.

## Required Dependencies

In order to do development for uFincs, you'll need the following depdenencies installed:

- Docker
- Docker Compose (note: we still use `docker-compose` rather than `docker compose`)
- Make
- Node/NPM

## Running Locally

It is very simple to get uFincs up and running using Docker:

```
make start
```

The services will then be available as follows: 

- Frontend: [localhost:3000](http://localhost:3000)
- Backend: [localhost:5000](http://localhost:5000)
- Marketing: [localhost:3002](http://localhost:3002)
- Storybook: [localhost:9009](http://localhost:9009)

Alternatively, if you don't need Storybook at the moment, you can run:

```
make start-no-storybook
```

I tend to do this since Storybook takes a while to start.

### Providing Environment Variables

By default, the Backend is missing certain third-party API keys (and it will warn you of such on start). These can be provided as environment variables. 

For more information, check out the [Backend's README](../../services/backend/README.md).

### Troubleshooting

If you run into the following error:

```
Error: ENOSPC: System limit for number of file watchers reached
```

Then you need to increase the file watcher limit. This can be done by e.g.:

```
echo fs.inotify.max_user_watches=1000000 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Repo Architecture

The best way to get familiarized with the architecture of the repo is just to go through the various folders and read their READMEs. Each high-level folder does a good job of explaining what it is and what important subfolders it has.

Of course, just reading through the code is also a good idea :)

## Coding Guidelines

As far as code style goes, you don't really get much a choice here: all of the code is governed and formatted by Prettier. So I suggest using something like the VS Code Prettier extension to have it automatically format your code on save. Otherwise, your code will not even pass the lint stage :)

Speaking of linting, besides Prettier, we also have ESLint (for JavaScript/TypeScript) and Stylelint (for Sass) with fairly strict rules. They must pass at all times (see respective services for commands on linting).

Other than linting, obviously things like "clean code" guidelines apply. Break things down, make them reusable (where it makes sense), and don't optimize prematurely.

Finally, testing. Since the Frontend has the vast majority of the logic, it has the vast majority of the tests. Which is to say... the Backend basically has no tests.

- Unit testing is handled using Jest. For any business-logic heavy code (e.g. data models or services), there should be unit tests on that code. Do not bother unit testing React components.
- For React components, instead write stories using Storybook.
- End-to-end testing is handled using Cypress. e2e tests should cover all major happy-path use cases and e2e tests should be written as regression tests to cover any newly discovered bugs.

Remember, the goal of testing is to run the test suite and be very confident that what you're about to deploy to production is going to work. Since uFincs does 'true' CI/CD (i.e. a merge to master triggers a deploy to production), having a robust test suite that instills confidence is paramount.

## Notes on Contributing

If you're just hacking away at uFincs and want to fork it, by all means! Do whatever you want with it.

If, however, you're hacking with the intent to contribute, make sure to check out the [CONTRIBUTING guide](../../CONTRIBUTING.md) for rules and guidelines for contributing to uFincs. 
