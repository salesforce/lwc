# Raptor Benchmarking

## Key features

* No hard dependency on Selenium / Webdriver or any other headless browsers.
* Capability to gather numbers directly from the CLI.
* Take a snapshot of the benchmark and the framework as standalone bundle. This offer the capability to:
    * replay the commit history to investigate performance regression
    * run the benchmark on any device directly from within the browser

### Directory sctructure

```bash
├── dist                # Directory containing the bundles artefacts & runner static application
├── runner              # Directory containing code related to the benchmark runner
│   ├── cli                 # CLI used for running the benchmark from the command line
│   ├── manager             # Runner shell application (written in Raptor)
│   ├── index.html          # Runner shell HTML page
│   └── runner.js           # A micro test runner injected in the runner frame
├── scripts             # Directory containing usefull build scripts
└── src                 # Directory containing the benchmarks files (glob: *.benchmark.js)
```

### Bundle structure

Each bundle is a directory containing 2 files:
* `bundle.js`: raptor framework + associated benchmarking tests
* `info.json`: metadata related to the bundle

The bundle folder name uses the following structure `bundle_<id>_<git-hash>_<branch_name>`:
* `id`: timestamp when the build has been generated
* `git_hash`: short version of the git commit hash associated to the bundle
* `branch_name`: git branch name associated to the commit. All the `/` character get replaced with `-`

In order to ease the comparision between different version of the framework, the build step on top creating the bundle folder in the `/dist` directory, also create the following symbolic links: `HEAD`, `<git-hash>`, `<branch_name>`

### Runner

The application in divided into 2 pieces:
* `manager.js`: Single page application created with Raptor. It takes care of instanciating the runner iframes and pretty print the results.
* `runner.js`: Micro benchmark runner. This script injected with the bundle in the iframe.

## How to use

### How to create bundles

Before running a benchmark you need to create bundles.

```bash
npm run build

# Compare branches
git checkout master
npm run build                           # /dist/master
git checkout my-feature
npm run build                           # /dist/my-feature

# Compare commit
git checkout 1071769
npm run build                           # /dist/1071769
git checkout 9f9eec7
npm run build                           # /dist/9f9eec7

# Compare uncommitted changes
npm run build  --label=new-changes      # /dist/new-changes
git stash
npm run build  --label=with-changes     # /dist/with-changes
```

### Runner app

```bash
npm start
open http://localhost:8000/index.html?base=/HEAD
```

You can pass the following query strings to the runner:
* `base` - **required**: the bundle folder url used as base for benchmarking
* `compare`: the bundle folder url used to compare against the base
* `grep`: a string used to filter the benchmark to run

**Examples**:
* http://localhost:8000/index.html?base=/HEAD
* http://localhost:8000/index.html?base=/HEAD&compare=/master
* http://localhost:8000/index.html?base=/benchmarking&compare=/master&grep=table

### Runner CLI

TODO
