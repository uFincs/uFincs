# Contributing to uFincs

Welcome to uFincs! If you're looking to contribute _anything_ (whether it be a bug report or a full feature), you've come to the right place.

## Table of Contents

- [Goals and Expecations](#goals-and-expectations-of-ufincs-as-an-open-source-project)
  - [Contributions we'll Consider](#contributions-well-consider)
  - [Contributions we'll Reject](#contributions-well-reject)
- [Workflow](#workflow)
  - [How to Report a Bug](#how-to-report-a-bug)
  - [How to Submit Changes](#how-to-submit-changes)
- [Appendix A: Issue Template](#appendix-a-issue-template)
- [Appendix B: PR Template](#appendix-b-pr-template)
- [Appendix C: Technical Checklist](#appendix-c-technical-checklist)
- [Appendix D: UI/UX Checklist](#appendix-d-uiux-checklist)

## Goals and Expectations of uFincs as an Open Source Project

Before you spend your valuable time to make a contribution, I want to save us both some time by setting some expectations.

The goal of uFincs as an open source project is to give people another option in the personal finance space. Specifically, one that they can tinker with or run standalone forever. However, I — being a single person — do not have the time nor energy to support uFincs as much as I might have once wanted.

As such, I provide no guarantee that anything — any contribution — will ever be addressed, in any timely manner. Unless you're a paying customer of [ufincs.com](https://ufincs.com), in which case please reach out directly through support@ufincs.com.

Obviously, that doesn't mean I _won't_ address contributions — quite the contrary. I just want the baseline to be agreed upon.

However, I understand how that kind of attitude can limit potential growth, so I'm basically expecting that uFincs gets forked off. That's fine; the MIT license was chosen for a reason after all.

### Contributions we'll Consider

Through GitHub Issues:

- Bug reports
- Requests/ideas for features/enhancements* <- note the asterisk

Through GitHub PRs:

- Bug fixes
- New features/enhancements*
- Substantial improvements to the documentation

\* See below for the asterisk.

### Contributions we'll Reject

- Requests/ideas for features/enhancements*
- Minor improvements to the documentation
  - e.g. spelling error fixes, etc
- Anything relating to the Marketing site
- Issues or PRs that do not follow other guidelines/templates
  - e.g. issues that are not descriptive enough, issues that just pose questions, issues that ask "why doesn't uFincs do X?", issues that do not follow the template in [Appendix A](#appendix-a-issue-template), etc

\* Anything relating to any of the items on the list of "What does uFincs _not_ do?" in the main [README](README.md#about-ufincs) or anything relating to support/problems of the Native (Capacitor) apps will be instantly rejected. Additionally, I will — in general — be very aggressive about marking requests/ideas as "wontfix".

## Workflow

### How to Report a Bug

Create a new issue in the "Issues" tab and follow the template outlined in [Appendix A](#appendix-a-issue-template). Assign the "bug" label to the issue.

In general, **great bug reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### How to Submit Changes

We follow the standard [Github Flow](https://guides.github.com/introduction/flow/index.html), so all code changes happen through pull requests (PRs).

To submit a change:

1. Fork the repo and create your branch from `master`.
2. Make your changes on that branch.
3. Ensure you have followed all of the items listed in [Appendix C](#appendix-c-technical-checklist) and [Appendix D](#appendix-d-uiux-checklist) as applicable.
4. Create a PR from your fork to the main uFincs repo using [Appendix B](#appendix-b-pr-template)

Note: Your submissions are understood to be under the same [MIT License](LICENSE.md) that covers the project.

## Appendix A: Issue Template

[provide general introduction to the issue and why it is relevant]

### Context

[provide more detailed introduction to the issue itself and why it is relevant]

### Reproduction Steps

[ordered list of the process to finding and recreating the issue, example below]

1. User goes to delete a dataset (to save space or whatever)
2. User gets popup modal warning
3. User deletes and it's lost forever

### Expected result

[describe what you would expect to have resulted from this process]

### Current result

[describe what you you currently experience from this process, and thereby explain the bug]

### Possible Fix

[not obligatory, but suggest fixes or reasons for the bug]

* Modal tells the user what dataset is being deleted, like “You are about to delete this dataset: car_crashes_2014.”
* A temporary "Trashcan" where you can recover a just deleted dataset if you mess up (maybe it's only good for a few hours, and then it cleans the cache assuming you made the right decision).

### Screenshot

[if relevant, include a screenshot]

## Appendix B: PR Template

[link to relavant issue and/or summary of changes being made]

Changelog:

- [a list of user-facing changes written in such a way that they could be published in a public changelog]

Implementation Details:

- [a list of technical details to call out which changes were made and/or why they were made]

Technical Debt:

- [an analysis of any tech debt this change introduces — aka, things that will need to be fixed later]

(note: see the [old Git history](docs/oldGitHistory.txt) for examples)

## Appendix C: Technical Checklist

The following are things to do/think about before submitting a PR:

- Relevant tests have been written for business logic
- Relevant Storybook stories have been written for React components
- Code is functional, tests/linter are passing
- Code has been formatted using Prettier
- Code has been documented sufficiently (e.g. comments explaining "why" not "what", public APIs documented, etc)
- `CAPACITOR_CHANGELOG.md` (in the Frontend) has been updated (if relevant)

Note: If you submit a PR that is obviously not adhering to some of these items, your PR will be rejected for wasting everyone's time.

## Appendix D: UI/UX Checklist

The following are things to think about before submitting a PR that contains UI changes. Did you properly consider:

- Transitions
- Animations
- Focus state
- Hover state
- Empty state
- Loading state
- Error state
- Disabled state
- EXcessively long text (for labels, inputs, etc)
- Responsive design
- Landscape design
- Shadows
- Color contrast
- Semantic HTML
- Title (tooltips)
- Aria tags
- Labels for inputs
- Alt tags for images
- Tab index
- Excessive divs that could have been e.g. fragments or other HTML elements
- First input grabs cursor focus in forms
- Mobile Storybook stories
- Landscape Storybook stories
- Proper touch interactions (i.e. they aren't sticky)
- Text selection colors
- Keyboard navigation (including Vimium)
- Webkit tap color
- Scrollable in landscape
- Cross browser compatiblity

Note: If you submit a PR that is obviously not adhering to some of these items, your PR will be rejected for wasting everyone's time.
