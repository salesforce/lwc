# Release Scripts

## `yarn release:version`

This script is used to generate a release commit that updates the version of all packages in this
monorepo. The version number should be specified through the interactive prompt.

The release commit is generated locally, along with a git tag.

## `yarn release:publish:ci`

This script publishes packages to NPM. It restricts usage to a CI context to ensure that all
tests are run as part of the process. It also restricts usage to release branches. A release
branch is defined as a branch that matches one of the following regular expressions:

-   /^master\$/
-   /^winter\d+\$/
-   /^spring\d+\$/
-   /^summer\d+\$/

This script is triggered when a git tag that matches the regular expression /^v.\*/ is pushed to
Github.

The npm dist-tag used depends on the current branch. If the current branch is `master` then the
dist-tag is `next`. For all other release branches (e.g., `winter21`), the branch name is used as
the dist-tag.
