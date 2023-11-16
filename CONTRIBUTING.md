# Contributing to Lightning Web Components

We want to encourage the developer community to contribute to Lightning Web Components. This guide has instructions to install, build, test and contribute to the framework.

- [Requirements](#requirements)
- [Installation](#installation)
- [Building LWC](#building-lwc)
- [Testing](#testing)
- [Git Workflow](#git-workflow)

Before you start, familiarize yourself with [Lightning Web Components](https://lwc.dev/guide/introduction).

## Requirements

 * [Node](https://nodejs.org/)
 * [Yarn](https://yarnpkg.com/)

This project uses [Volta](https://volta.sh/) to ensure that all the contributors share the same version of `Node` and `Yarn` for development. If you are considering making frequent contributions to this project, we recommend installing this tool as well. Otherwise, check the `volta` field in `package.json` to see which versions to use.

## Installation

[Set up SSH access to Github][setup-github-ssh] if you haven't done so already.

### 1) Download the repository

```bash
git clone git@github.com:salesforce/lwc.git
```

### 2) Install Dependencies

*We use [yarn](https://yarnpkg.com/) because it is significantly faster than npm for our use case. See this command [cheatsheet](https://yarnpkg.com/lang/en/docs/migrating-from-npm/).*

```bash
yarn install
```

If this fails with an error about *UNABLE_TO_GET_ISSUER_CERT_LOCALLY*, *Error: unable to get local issuer certificate*, or a registry communication issue then re-verify that step 2 was successful.

## Building LWC

```bash
yarn build
```

## Dev / watch mode

```bash
yarn dev
```

## Testing

### Unit Testing LWC

When developing LWC, utilize [jest](https://jestjs.io/en/) unit testing to provide test coverage for new functionality. To run the jest tests use the following command from the root directory:

```bash
yarn test
```

Additionally, the testing can be started in 'watch' mode which allows for automatic test re-runs on save:

```bash
yarn test --watch
```

To execute a particular test, use the following command:

```bash
yarn test <path_to_test>
```

If you change the way the compiler outputs code, then you may see failed tests due to these changes. In those cases, you can regenerate the test snapshots like so:

```bash
yarn test -u
```

If you want to debug these tests, you can do as follow:

1. First, insert a new line in your test where you think it might be failing and type `debugger`. This will serve as a break point for the debugger to stop at.
2. Open up Chrome and type in the address bar: `chrome://inspect`
3. Click on "Open dedicated DevTools for Node"
4. In your terminal, type the following command: `yarn test:debug <path_to_test>`

Your test should now be running in the Chrome debugger which you can use to poke around and explore. Now simply hit Enter in the terminal running your Jest process anytime you want to re-run your currently selected specs. You'll be dropped right back into the Chrome debugger.

### Integration Testing LWC

When developing LWC, use integration testing to ensure functionality is correctly reflected in the browser. This repo has two integration test suites.
- @lwc/integration-karma: Contains all integration tests that can run with javascript only. For information about usage and contribution, refer to this [documentation][integration-karma-readme].
- @lwc/integration-tests: Contains all other integration tests that require web driver API support (e.g., focus, keyboard navigation). For information about usage and contribution, refer to this [documentation][integration-test-readme].

### Performance testing LWC

```shell
yarn build
yarn build:performance
yarn test:performance
```

This will run all performance tests comparing the current code to the latest `master` branch. See the `@lwc/perf-benchmarks` package's README for more details.

### Bundle size monitoring

```shell
yarn build
yarn bundlesize
```

This will check that the minified bundle sizes don't exceed our thresholds. Our goal is to stay consciously aware of the bundle sizes as the repository grows over time.

### Types

LWC relies on type annotations.

* Make sure your editor supports [typescript](https://www.typescriptlang.org/).

### ESLint

[Configure your editor][eslint-integrations] to use our eslint configurations.


## Git Workflow

The process of submitting a pull request is fairly straightforward and
generally follows the same pattern each time:

1. [Fork the LWC repo](#fork-the-lwc-repo)
1. [Create a feature branch](#create-a-feature-branch)
1. [Make your changes](#make-your-changes)
1. [Rebase](#rebase)
1. [Check your submission](#check-your-submission)
1. [Create a pull request](#create-a-pull-request)
1. [Update the pull request](#update-the-pull-request)
1. [Commit Message Guidelines](#commit)

### Fork the LWC repo

[Fork][fork-a-repo] the [salesforce/lwc](https://github.com/salesforce/lwc) repo. Clone your fork in your local workspace and [configure][configuring-a-remote-for-a-fork] your remote repository settings.
```bash
git clone git@github.com:<YOUR-USERNAME>/lwc.git
cd lwc
git remote add upstream git@github.com:salesforce/lwc.git
```

### Create a feature branch

```bash
git checkout master
git pull origin master
git checkout -b <name-of-the-feature>
```

### Make your changes

Modify the files, build, test, lint and eventually commit your code using the following command:

```bash
git add <path/to/file/to/commit>
git commit or git cz
git push origin <name-of-the-feature>
```
Commit your changes using a descriptive commit message that follows our [Commit Message Guidelines](#commit). Adherence to these conventions is necessary because release notes are automatically generated from these messages.
NOTE: optional use of _git cz_ command triggers interactive semantic commit, which prompts user with commit related questions, such as commit type, scope, description, and breaking changes. Use of _git cz_ is optional but recommended to ensure format consistency.

The above commands will commit the files into your feature branch. You can keep
pushing new changes into the same branch until you are ready to create a pull
request.

### Rebase

Sometimes your feature branch will get stale with respect to the master branch,
and it will require a rebase. The following steps can help:

```bash
git checkout master
git pull upstream master
git checkout <name-of-the-feature>
git rebase upstream/master
```

_note: If no conflicts arise, these commands will ensure that your changes are applied on top of the master branch. Any conflicts will have to be manually resolved._

### Check your submission

#### Lint your changes

```bash
yarn run lint
```

The above command may display lint issues that are unrelated to your changes.
The recommended way to avoid lint issues is to [configure your
editor][eslint-integrations] to warn you in real time as you edit the file.

Fixing all existing lint issues is a tedious task so please pitch in by fixing
the ones related to the files you make changes to!

#### Run tests

Test your change by running the unit tests and integration tests. Instructions [here](#testing).

### Create a pull request

If you've never created a pull request before, follow [these
instructions][creating-a-pull-request]. Pull request samples can be found [here](https://github.com/salesforce/lwc/pulls)

#### Pull Request Title
A pull request title follows [conventional commit](#commit) format and is automatically validated by our CI.
```shell
ex:
commit-type(optional scope): commit description. ( NOTE: space between column and the message )

Types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test, proposal.
Scope: The scope should be the name of the npm package affected (engine, compiler, wire-service, etc.)
```

### Update the pull request

```sh
git fetch origin
git rebase origin/${base_branch}

# If there were no merge conflicts in the rebase
git push origin ${feature_branch}

# If there was a merge conflict that was resolved
git push origin ${feature_branch} --force
```

_note: If more changes are needed as part of the pull request, just keep committing and pushing your feature branch as described above and the pull request will automatically update._

### <a name="commit"></a> Commit Message Conventions

Git commit messages have to be formatted according to a well defined set of rules. This leads to **more
readable messages** that are easy to follow when looking through the **project history**.

#### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Samples: (even more [samples](https://github.com/salesforce/lwc/pulls))

```
docs(changelog): update change log to beta.5
```
```
fix(release): need to depend on latest rxjs and zone.js

The version in our package.json gets copied to the one we publish, and users need the latest of these.
```

#### Reverting a commit
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

#### Commit Type
Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **chore**: Other changes that don't modify src or test files
* **ci**: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **revert**: Reverts a previous commit
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **test**: Adding missing tests or correcting existing tests

#### Commit Scope

The scope should be the name of the npm package affected, as perceived by the person reading the changelog.

There are currently a few exceptions to the "use package name" rule:

* **packaging**: used for changes that change the npm package layout in all of our packages, e.g. public path changes, package.json changes done to all packages, d.ts file/format changes, changes to bundles, etc.
* **changelog**: used for updating the release notes in CHANGELOG.md
* **lwc docs**: used for docs related changes within the lwc/docs directory of the repo
* none/empty string: useful for `style`, `test` and `refactor` changes that are done across all packages (e.g. `style: add missing semicolons`)

#### Commit Subject

The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

#### Commit Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Commit Footer
The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

[fork-a-repo]: https://help.github.com/en/articles/fork-a-repo
[configuring-a-remote-for-a-fork]: https://help.github.com/en/articles/configuring-a-remote-for-a-fork
[setup-github-ssh]: https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
[creating-a-pull-request]: https://help.github.com/articles/creating-a-pull-request/
[eslint-integrations]: http://eslint.org/docs/user-guide/integrations
[integration-test-readme]: https://github.com/salesforce/lwc/blob/master/packages/@lwc/integration-tests/README.md
[integration-karma-readme]: https://github.com/salesforce/lwc/blob/master/packages/@lwc/integration-karma/README.md

## Getting your changes reviewed

**Potential pitfalls:** When submitting changes to the LWC framework, there are several important considerations to keep in mind to ensure that your changes are reviewed & accepted.

- The LWC framework makes strong guarantees about backwards compatibility to those that use our framework. Any changes that compromise these guarantees are unlikely to be accepted as-is.
- If your change causes a test to fail in unit or integration tests, it is unlikely that your submission will be accepted as-is.
- Certain parts of the codebase are particularly susceptible to breaking changes. This includes the browser runtime (`engine-core` and `engine-dom`), as well as the compiler (`compiler`, `style-compiler`, `template-compiler`).
- Some areas of the codebase are less mature and undergoing active development. Areas related to SSR, including the server-side runtime (`engine-server`), fall under this category.

**Definition of done:** Especially when making large changes to the codebase, certain complementary work must be undertaken for the desired changes to be considered. When making a submission please adhere to the following:

- All pre-existing unit- & integration- tests must pass.
- If you modify a pre-existing test to accommodate your changes, a thorough reasoning must be proactively provided in the PR.
- Test coverage should not decline – if you add code paths, add corresponding tests.
- If your tests have the potential to negatively impact performance, provide a before & after comparison of performance using the test collateral provided in the repo.

It's also worth noting that not all submissions will be accepted, even if all the above criteria are met. There may be constraints in the larger Salesforce ecosystem that prevent certain changes. If your submission is likely to change large parts of the codebase, please open an issue preemptively so that the design can be discussed.
