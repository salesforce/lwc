# Package management

This repo is multi-package, which means it holds several internal sub npm packages inside. This simplifies the development process since you can build, test, and publish all packages at once in a centralized way. ``lerna`` is used to manage the sub packages.


## Publish packages to Nexus

Due to a bug in Nexus and most enterprise npm solutions -- can't remove dist-tags -- use this flow to publish packages.

1. Update version of all changed packages: `lerna publish --skip-npm --skip-git`
2. Review changes: `git status && git diff`
3. Commit changes to git: `git commit`
4. Get your changes into git master (eg pull request)
5. Publish npm packages: `lerna exec -- npm publish`


## Default lerna publishing flow

*This flow does not work with Nexus!* This is provided for reference only.
Make sure you are authenticated useing `npm whoami`.
If you are not use `npm login` (you don't need to specify `--registry` since its part of the project config)

1. Run `lerna publish` in the root directory.
2. Choose the version
3. Ship it!

