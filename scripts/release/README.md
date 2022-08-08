# Release Scripts

## `yarn release:version`

This script is used to generate a release commit that updates the version of all packages in this
monorepo. The version number should be specified through the interactive prompt.

The release commit is generated locally, along with a git tag.

:rotating_light: Please avoid pushing prerelease git tags such as `alpha`. These tags usually
point to commits that are not guaranteed to exist at a later time due to squashed merges or
deleted branches.
