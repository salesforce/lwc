# Release Scripts

## `yarn release:version`

This script is used to generate and tag a commit that updates the version of all packages in the
monorepo. The tag should be specified through an interactive prompt after the script is run.

By default, both the release commit and its associated tag are only generated locally. Adding the
`--push` flag will automatically push both commit and tag to the branch corresponding to the
local branch on Github:

```sh
yarn release:version --push
```
