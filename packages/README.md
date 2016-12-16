# Package management
This repo is multi-package, which means it holds several internal sub npm packages inside.
This helps a lot the development process since you can build, test, and publish all packages at once in a centralized way.

## Publishing packages with lerna

Make sure you are authenticated useing `npm whoami`. 
If you are not use `npm login` (you don't need to specify `--registry` since its part of the project config)
 
1. Run `lerna publish` in the root directory.
2. Choose the version
3. Ship it!

## Alternative centralized install  - Bug in enterprise npm

Due to a bug in the enterprise npm (can't remove dist-tags), here is the alternative flow:

1. `lerna publish --skip-npm`
2. `lerna exec -- npm publish`
3. Look at the version you just pushed using `git tag`
3. Push the new tag to the origin `git push origin v0.0.0` 


