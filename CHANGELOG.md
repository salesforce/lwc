# [](https://github.com/salesforce/lwc/compare/v1.1.15...v) (2019-12-23)


### Bug Fixes

* **compiler:** decorated props duplicated in fields ([#1641](https://github.com/salesforce/lwc/issues/1641)) ([#1647](https://github.com/salesforce/lwc/issues/1647)) ([de3df18](https://github.com/salesforce/lwc/commit/de3df18c7522c8a0ce36aff903cf7a9ba5cb9272))
* **style-compiler:** upgrade postcss and cssnano ([#1633](https://github.com/salesforce/lwc/issues/1633)) ([98044ab](https://github.com/salesforce/lwc/commit/98044ab98f4bf6d2d79067f3b1ef15ab5a5a441f))


### Features

* inline import of the compat and prod libraries ([#1640](https://github.com/salesforce/lwc/issues/1640)) ([ec9f7be](https://github.com/salesforce/lwc/commit/ec9f7bed2ab32ea1076d68a2584d3a1c955afb69))



## [1.1.15](https://github.com/salesforce/lwc/compare/v1.1.14...v1.1.15) (2019-12-04)



## [1.1.14](https://github.com/salesforce/lwc/compare/v1.1.13...v1.1.14) (2019-11-27)


### Bug Fixes

* restrict tags that can be inside a math tag ([#1620](https://github.com/salesforce/lwc/issues/1620)) ([2f20c47](https://github.com/salesforce/lwc/commit/2f20c4771f8b34ede5fc7b6a784e49387f1df850))
* **synthetic-shadow:** qunit has issues when document object is patched ([#1625](https://github.com/salesforce/lwc/issues/1625)) ([06d459e](https://github.com/salesforce/lwc/commit/06d459ee405548109dac28794e092f88975c567a))



## [1.1.13](https://github.com/salesforce/lwc/compare/v1.1.12...v1.1.13) (2019-11-13)



## [1.1.12](https://github.com/salesforce/lwc/compare/v1.1.11...v1.1.12) (2019-11-11)


### Bug Fixes

* **compiler:** make name and namespace optional ([#1609](https://github.com/salesforce/lwc/issues/1609)) ([54b1529](https://github.com/salesforce/lwc/commit/54b1529be1b677640a260e94bf83f272f13fd7e5))
* **synthetic-shadow:** use native mutation observer for portal elements ([#1596](https://github.com/salesforce/lwc/issues/1596)) ([4b5995f](https://github.com/salesforce/lwc/commit/4b5995fb89e1b6e1eb83cf2f4bfc64a7479a8eaa))



## [1.1.11](https://github.com/salesforce/lwc/compare/v1.1.10...v1.1.11) (2019-11-01)


### Bug Fixes

* **engine:** lifecycle callback invocation order for native shadow ([#1604](https://github.com/salesforce/lwc/issues/1604)) ([927d879](https://github.com/salesforce/lwc/commit/927d87901ee7a1eaf94f93290afcec833514a3e7))


### Reverts

* Revert "feat: add wire config as function (#1455)" (#1601) ([722979e](https://github.com/salesforce/lwc/commit/722979e4b4c411e06e8404931a484d4573ef77b3)), closes [#1455](https://github.com/salesforce/lwc/issues/1455) [#1601](https://github.com/salesforce/lwc/issues/1601) [#1455](https://github.com/salesforce/lwc/issues/1455)



## [1.1.10](https://github.com/salesforce/lwc/compare/v1.1.8...v1.1.10) (2019-10-31)


### Bug Fixes

* **ci:** set node version to 10.16.3 until 10.17 is evaluated ([#1597](https://github.com/salesforce/lwc/issues/1597)) ([8f57622](https://github.com/salesforce/lwc/commit/8f57622189415be5c719ee78486202c6a337f3d4))
* **synthetic-shadow:** make isNodeShadowed to only check owner key ([#1599](https://github.com/salesforce/lwc/issues/1599)) ([e325eba](https://github.com/salesforce/lwc/commit/e325eba67187d399bf310f40bef44ddf1cde8a99))



## [1.1.8](https://github.com/salesforce/lwc/compare/v1.1.7...v1.1.8) (2019-10-23)


### Bug Fixes

* **synthetic-shadow:** remove ownerKeys of migrated dom:manual ([#1590](https://github.com/salesforce/lwc/issues/1590)) ([6ec5c9b](https://github.com/salesforce/lwc/commit/6ec5c9b048d8db63b5ea6eba36eba6f4170b40c2))



## [1.1.7](https://github.com/salesforce/lwc/compare/v1.1.6...v1.1.7) (2019-10-23)



## [1.1.6](https://github.com/salesforce/lwc/compare/v1.1.5...v1.1.6) (2019-10-22)



## [1.1.5](https://github.com/salesforce/lwc/compare/v1.1.4-alpha1...v1.1.5) (2019-10-18)


### Bug Fixes

* update release_npm script ([#1581](https://github.com/salesforce/lwc/issues/1581)) ([517bbff](https://github.com/salesforce/lwc/commit/517bbffeefed7f784ffc8fce5080465e125be568))
* **synthetic-shadow:** fixes contains in ie11 ([#1586](https://github.com/salesforce/lwc/issues/1586)) ([1422b91](https://github.com/salesforce/lwc/commit/1422b9101797e67495aa38129addba56240ce379))



## [1.1.4-alpha1](https://github.com/salesforce/lwc/compare/v1.1.4...v1.1.4-alpha1) (2019-10-15)



## [1.1.4](https://github.com/salesforce/lwc/compare/v1.1.3...v1.1.4) (2019-10-15)


### Bug Fixes

* svg usage ([#1574](https://github.com/salesforce/lwc/issues/1574)) ([8d64bfc](https://github.com/salesforce/lwc/commit/8d64bfcf4da9f933dae647236fdf807d165b91ba))


### Features

* upgrade dependencies ([#1576](https://github.com/salesforce/lwc/issues/1576)) ([cc94f9c](https://github.com/salesforce/lwc/commit/cc94f9ccd1fd0752455c3670a1f9c86176b278c7))



## [1.1.3](https://github.com/salesforce/lwc/compare/v1.1.0...v1.1.3) (2019-10-14)


### Bug Fixes

* missing dep ([#1553](https://github.com/salesforce/lwc/issues/1553)) ([a8f49a2](https://github.com/salesforce/lwc/commit/a8f49a2f298cf937f72329d9c0dbf5eb8ad16d6e))
* **engine:** refactor boundary protection for render phase ([#1551](https://github.com/salesforce/lwc/issues/1551)) ([4942cc4](https://github.com/salesforce/lwc/commit/4942cc44de98cae24862df4135f443ea13959555)), closes [#1507](https://github.com/salesforce/lwc/issues/1507) [issue#1506](https://github.com/issue/issues/1506)
* **feature-flags:** Enable feature flags in lwc distribution ([#1555](https://github.com/salesforce/lwc/issues/1555)) ([edc6fbd](https://github.com/salesforce/lwc/commit/edc6fbdecad16a2f305b0c59b6491b90dd40b433))
* **features:** make @lwc/features a public package ([#1552](https://github.com/salesforce/lwc/issues/1552)) ([f280767](https://github.com/salesforce/lwc/commit/f280767c4d3e4ef9794cc7454a3f71abb7ce4d60))
* **lwc:** fix incorrect module path in package.json for lwc package ([#1566](https://github.com/salesforce/lwc/issues/1566)) ([97353d5](https://github.com/salesforce/lwc/commit/97353d54d8ef163d61be90d7e5cd71c9ffb5a0f5))
* **module-resolver:** typescript module resolution bug ([#1567](https://github.com/salesforce/lwc/issues/1567)) ([6050e1e](https://github.com/salesforce/lwc/commit/6050e1e5361b30756635f799e196faf7ba7c456c))
* **synthetic-shadow:** addEventListener for custom elements ([#1572](https://github.com/salesforce/lwc/issues/1572)) ([3f8da46](https://github.com/salesforce/lwc/commit/3f8da466485779ec487858bb042c43a0fa68c64b))
* **synthetic-shadow:** do not patch lwc root elements ([#1557](https://github.com/salesforce/lwc/issues/1557)) ([fd2f57f](https://github.com/salesforce/lwc/commit/fd2f57f62181ae62be3417a8243ea29c611db876))
* **synthetic-shadow:** querySelectors not returning ([#1568](https://github.com/salesforce/lwc/issues/1568)) ([b5a3c39](https://github.com/salesforce/lwc/commit/b5a3c39b72693dc76049b7d9990b952b92a0abb2))


### Features

* element and nodes apis behind a runtime flag ([#1550](https://github.com/salesforce/lwc/issues/1550)) ([03231bb](https://github.com/salesforce/lwc/commit/03231bb91ba4112fed97ec46409cb2d848326592))
* **features:** add support for unary negation ([#1562](https://github.com/salesforce/lwc/issues/1562)) ([4671e4c](https://github.com/salesforce/lwc/commit/4671e4cac81b77c9334e9c810d7e7214b408c636))



# [1.1.0](https://github.com/salesforce/lwc/compare/v1.0.2...v1.1.0) (2019-10-04)


### Bug Fixes

* account for clicks on form element labels when delegating focus ([#1430](https://github.com/salesforce/lwc/issues/1430)) ([d5e4be3](https://github.com/salesforce/lwc/commit/d5e4be376cbf8f8673bc164fe7bd8ac62e546ab2))
* add debug mode to facade ([#1544](https://github.com/salesforce/lwc/issues/1544)) ([096e8c8](https://github.com/salesforce/lwc/commit/096e8c87221719ed49ce9afa3db8b6a653cce388))
* add wire test to ensure we support named imports ([#1468](https://github.com/salesforce/lwc/issues/1468)) ([828aaca](https://github.com/salesforce/lwc/commit/828aacafe5aca12a5234d6c4c120926932025bfb))
* address security vulnerability CVE-2019-10744 ([#1407](https://github.com/salesforce/lwc/issues/1407)) ([1fe64d8](https://github.com/salesforce/lwc/commit/1fe64d8f8d08d712f6ba87799e4194256f2e3814))
* cloneNode() default behavior should match spec ([#1480](https://github.com/salesforce/lwc/issues/1480)) ([9a7f822](https://github.com/salesforce/lwc/commit/9a7f8224d52bd6e46144e5cf75acbb28e8787a07))
* containsPatched when otherNode is null or undefined ([#1493](https://github.com/salesforce/lwc/issues/1493)) ([d9aefa7](https://github.com/salesforce/lwc/commit/d9aefa7049c1ec4288f9f74685a7c3ceee6cd0e0))
* convert nodelist to array before passing to native Array methods ([#1548](https://github.com/salesforce/lwc/issues/1548)) ([c3fd522](https://github.com/salesforce/lwc/commit/c3fd522d0050d763b7d36317bc68ec4848ecdd2d))
* error from disconnecting an already disconnected vm ([#1413](https://github.com/salesforce/lwc/issues/1413)) ([d61988d](https://github.com/salesforce/lwc/commit/d61988dddfa86dd03f1aba4cade630ace2a18e5d))
* escape hatch for async event target accessor ([#1510](https://github.com/salesforce/lwc/issues/1510)) ([1e55195](https://github.com/salesforce/lwc/commit/1e55195172ad6b6dc4635128719cd6c781640027))
* focus method invocation inside shadow should not skip shadow ([#1442](https://github.com/salesforce/lwc/issues/1442)) ([bc7f38a](https://github.com/salesforce/lwc/commit/bc7f38afd4011310755d3efe6f822ac621ea4966))
* issue with Node.textContent returning text in comment nodes ([#1461](https://github.com/salesforce/lwc/issues/1461)) ([3ad12e2](https://github.com/salesforce/lwc/commit/3ad12e2719bfc4c7f27d3c110e36ae33fd8e0395))
* lwc module not resolving prod mode ([#1472](https://github.com/salesforce/lwc/issues/1472)) ([eeb6930](https://github.com/salesforce/lwc/commit/eeb693037c587c0432ba5f6808e2127e291c616e))
* missing shared dependency ([#1543](https://github.com/salesforce/lwc/issues/1543)) ([3a0a2b6](https://github.com/salesforce/lwc/commit/3a0a2b654d72b5cf3635ff1e2c1697190f4c5e86))
* move private package deps to dev deps ([#1531](https://github.com/salesforce/lwc/issues/1531)) ([6452906](https://github.com/salesforce/lwc/commit/6452906aff329f8bde07bc36cbdcee5b3fc97cb6))
* mutationobserver memory leak - use weakmap for bookkeeping ([#1423](https://github.com/salesforce/lwc/issues/1423)) ([165ad3b](https://github.com/salesforce/lwc/commit/165ad3b2a659e47c53f207b0ce9d55afdd7c5d10))
* nested style fix ([#1378](https://github.com/salesforce/lwc/issues/1378)) ([1cdc92e](https://github.com/salesforce/lwc/commit/1cdc92eb028e232773d9b39cdc70171868cd5542))
* package internal dependencies ([#1541](https://github.com/salesforce/lwc/issues/1541)) ([5ad74d3](https://github.com/salesforce/lwc/commit/5ad74d310eb5be36424603f65bae7f25508efd8a))
* relax condition to retarget event ([#1527](https://github.com/salesforce/lwc/issues/1527)) ([c6cde9c](https://github.com/salesforce/lwc/commit/c6cde9cd72c65aef145c2d7fe8fcaef4fa16bd19))
* remove dead code ([#1503](https://github.com/salesforce/lwc/issues/1503)) ([044077f](https://github.com/salesforce/lwc/commit/044077f385e76b1661c76c4764611294251beb45))
* remove side effects assertion in non-decorated fields ([#1491](https://github.com/salesforce/lwc/issues/1491)) ([8646642](https://github.com/salesforce/lwc/commit/86466421268b07c5ccad73e1dad82c5732d103eb))
* rollup-plugin module resolve when rootDir is a relative pa… ([#1471](https://github.com/salesforce/lwc/issues/1471)) ([c8da2ee](https://github.com/salesforce/lwc/commit/c8da2ee3593fff556ea8950939255b0c43bdb72f))
* **compiler:** prevent underscore attr name camelcasing ([#1385](https://github.com/salesforce/lwc/issues/1385)) ([49162fc](https://github.com/salesforce/lwc/commit/49162fcb4dd505540253721acd6c3f9f757e9a3f))
* **engine:** [#1295](https://github.com/salesforce/lwc/issues/1295) - removing hack to support old metadata in tests ([#1436](https://github.com/salesforce/lwc/issues/1436)) ([a40d174](https://github.com/salesforce/lwc/commit/a40d174feb29dce0eb9a2a353a487135928c7c84))
* **engine:** issue [#858](https://github.com/salesforce/lwc/issues/858) to enable the ability to have setters reactive ([#1038](https://github.com/salesforce/lwc/issues/1038)) ([c270594](https://github.com/salesforce/lwc/commit/c2705949c29b614206d23e6b068ea4fab75ef9a5))
* **engine:** issue 1435 disconnect bug when switching templates ([#1443](https://github.com/salesforce/lwc/issues/1443)) ([b0c4512](https://github.com/salesforce/lwc/commit/b0c451291a533348e534fa96847692e7aa550426)), closes [#1435](https://github.com/salesforce/lwc/issues/1435) [#1448](https://github.com/salesforce/lwc/issues/1448) [#1435](https://github.com/salesforce/lwc/issues/1435)
* **engine:** reactive setters behind a flag ([#1444](https://github.com/salesforce/lwc/issues/1444)) ([bdb8d98](https://github.com/salesforce/lwc/commit/bdb8d987bf4cda395956582c95ddc6c9b8191d5e))
* **engine:** template inheritance is broken ([#1400](https://github.com/salesforce/lwc/issues/1400)) ([83d9881](https://github.com/salesforce/lwc/commit/83d988159bd5b7c221aa76ca47fc2e8f374885f5))
* **engine:** test was incorrect ([#1393](https://github.com/salesforce/lwc/issues/1393)) ([4960afe](https://github.com/salesforce/lwc/commit/4960afeab0ac978a331a6af84adf5a078895d9f0))
* **features:** flag name must match name of imported binding ([#1463](https://github.com/salesforce/lwc/issues/1463)) ([89ee65e](https://github.com/salesforce/lwc/commit/89ee65e0a87ff9a6b407f37aa542164638c7dacb))
* **features:** remove nested feature flags limitation ([#1473](https://github.com/salesforce/lwc/issues/1473)) ([b4ac97c](https://github.com/salesforce/lwc/commit/b4ac97cf88232774eb41caaf8dd2eb454ae618fa))
* wrap iframe contentWindow only for iframe elements that are keyed ([#1514](https://github.com/salesforce/lwc/issues/1514)) ([12df751](https://github.com/salesforce/lwc/commit/12df751281016da3c6a5524f0bc88df5e6f006e5))
* **rollup-plugin:** plugin now correctly resolves relative ts imports ([#1516](https://github.com/salesforce/lwc/issues/1516)) ([d6423f9](https://github.com/salesforce/lwc/commit/d6423f9a7be1e04f6aba648798e2671d9d1f0e57))
* **synthetic:** consider ancestors when determining click-focusability ([#1383](https://github.com/salesforce/lwc/issues/1383)) ([5d4dc4d](https://github.com/salesforce/lwc/commit/5d4dc4df74283e940e282f1a6e9d7a2a25388a7c)), closes [#1382](https://github.com/salesforce/lwc/issues/1382)


### Features

* add N paths to generate packages ([#1411](https://github.com/salesforce/lwc/issues/1411)) ([41e53e1](https://github.com/salesforce/lwc/commit/41e53e1fd7cc9ec35b3a076ffedd9def4b13af8a))
* add volta support ([#1451](https://github.com/salesforce/lwc/issues/1451)) ([5b21e3c](https://github.com/salesforce/lwc/commit/5b21e3c30ad21c2517d12ebca70d024cea115058))
* add wire config as function ([#1455](https://github.com/salesforce/lwc/issues/1455)) ([81a6e48](https://github.com/salesforce/lwc/commit/81a6e484a0808b9b171dd9df733df248d25f57ab))
* allow MemberExpression on wire adapters ([#1402](https://github.com/salesforce/lwc/issues/1402)) ([7ee68f0](https://github.com/salesforce/lwc/commit/7ee68f0de172ce4bce04f472a737c29b82e4a3c7))
* dynamic imports (experimental flag) ([#1397](https://github.com/salesforce/lwc/issues/1397)) ([969d124](https://github.com/salesforce/lwc/commit/969d124ad06f04dba8eb337478222b77ec7018be))
* hide gus urls ([#1446](https://github.com/salesforce/lwc/issues/1446)) ([850bd12](https://github.com/salesforce/lwc/commit/850bd12931c14181d697b7225b59322d7af009c3))
* move to best v4 ([#1432](https://github.com/salesforce/lwc/issues/1432)) ([63b28cb](https://github.com/salesforce/lwc/commit/63b28cb9153d7452801fd008053c70de5f32f713))
* refactor module resolution ([#1414](https://github.com/salesforce/lwc/issues/1414)) ([ce73c8e](https://github.com/salesforce/lwc/commit/ce73c8e906fc9aba884b520d87b6191332dc4f11))
* **engine:** feature flags ([#1425](https://github.com/salesforce/lwc/issues/1425)) ([a0a0862](https://github.com/salesforce/lwc/commit/a0a08622cfc60c430f9f1dd4f3a7dfecbc4d6cbf))
* **engine:** testable feature flags for jest tests ([#1456](https://github.com/salesforce/lwc/issues/1456)) ([d955b51](https://github.com/salesforce/lwc/commit/d955b518de0701a4dcfee7eb8bfcbfe2f99a6c30))
* track decorator reform ([#1428](https://github.com/salesforce/lwc/issues/1428)) ([2dcaa8c](https://github.com/salesforce/lwc/commit/2dcaa8c121caf56f0c8bc243128e32b5ef9c4f4c)), closes [salesforce/lwc-rfcs#4](https://github.com/salesforce/lwc-rfcs/issues/4)
* **integration-karma:** feature flag support ([#1482](https://github.com/salesforce/lwc/issues/1482)) ([e69cee2](https://github.com/salesforce/lwc/commit/e69cee26e1801e4d8dd4b910f82ce002611491ce))
* **template-compiler:** binding ast parser ([#1498](https://github.com/salesforce/lwc/issues/1498)) ([1d77e5e](https://github.com/salesforce/lwc/commit/1d77e5ec8e1423513129a26a3841cbcab4c7bc9d))


### Reverts

* Revert "feat(template-compiler): binding ast parser (#1498)" (#1538) ([3e87c2c](https://github.com/salesforce/lwc/commit/3e87c2c1ab2f4af3458c3237e63f7bb1d0f08c94)), closes [#1498](https://github.com/salesforce/lwc/issues/1498) [#1538](https://github.com/salesforce/lwc/issues/1538)



## [1.0.2](https://github.com/salesforce/lwc/compare/v1.0.1...v1.0.2) (2019-06-24)


### Bug Fixes

* **engine:** avoid reusing vnode.elm unless it is style tag for native ([#1365](https://github.com/salesforce/lwc/issues/1365)) ([33f7e0c](https://github.com/salesforce/lwc/commit/33f7e0c79e3d5977e7542a77c0bf51cbb2164f71))
* **synthetic-shadow:** expose iframe contentWindow event methods ([#1368](https://github.com/salesforce/lwc/issues/1368)) ([#1375](https://github.com/salesforce/lwc/issues/1375)) ([eaf9749](https://github.com/salesforce/lwc/commit/eaf9749d12fa3267d9edf60bd350da86b2c69632))



## [1.0.1](https://github.com/salesforce/lwc/compare/v1.0.0...v1.0.1) (2019-06-19)


### Bug Fixes

* **engine:** update typescript to the latest ([#1342](https://github.com/salesforce/lwc/issues/1342)) ([8b10e72](https://github.com/salesforce/lwc/commit/8b10e72bb7a8f398161663414a84e4b5f8c588a0))
* **synthetic-shadow:** cleaning up tests ([#1334](https://github.com/salesforce/lwc/issues/1334)) ([64a3f5e](https://github.com/salesforce/lwc/commit/64a3f5e31f90d7461cc0ae100911988e7a1711ff)), closes [#1311](https://github.com/salesforce/lwc/issues/1311)
* disable attribute reflection restriction for tests ([#1354](https://github.com/salesforce/lwc/issues/1354)) ([90dd79d](https://github.com/salesforce/lwc/commit/90dd79daf9792838fc6ee592b71ceb967aebb671))
* issue [#1304](https://github.com/salesforce/lwc/issues/1304) activeElement should be patched in the prototype ([#1321](https://github.com/salesforce/lwc/issues/1321)) ([504e27a](https://github.com/salesforce/lwc/commit/504e27a7784121177c98fe2460cb663291fbbcaf))



# [1.0.0](https://github.com/salesforce/lwc/compare/v0.41.0...v1.0.0) (2019-05-29)


### Bug Fixes

* make synthetic-shadow resolvable by module-resolver ([#1281](https://github.com/salesforce/lwc/issues/1281)) ([37f8cf2](https://github.com/salesforce/lwc/commit/37f8cf2a3461da54d8c5a9cdfe84bc949758097a))
* synthetic-shadow in Best ([#1310](https://github.com/salesforce/lwc/issues/1310)) ([6fc3b23](https://github.com/salesforce/lwc/commit/6fc3b23ef433b61965086dd01baa353eab81c4ce))
* **engine:** using jest environment - upgrading jsdom ([#1312](https://github.com/salesforce/lwc/issues/1312)) ([2a81f7f](https://github.com/salesforce/lwc/commit/2a81f7f7ffb787f79417c37f65677048b6be932f))



# [0.41.0](https://github.com/salesforce/lwc/compare/v0.40.1...v0.41.0) (2019-05-26)


### Bug Fixes

* **css-compiler:** relaxation of attribute css rules ([#1248](https://github.com/salesforce/lwc/issues/1248)) ([35fb5f5](https://github.com/salesforce/lwc/commit/35fb5f556ceab754248843e7b51ee46ffa228b5b))
* **synthetic-shadow:** new added tests using the old test utils ([#1254](https://github.com/salesforce/lwc/issues/1254)) ([34dd4b9](https://github.com/salesforce/lwc/commit/34dd4b9fd3f28272ad231fbe9d642817de07a980))
* **synthetic-shadow:** prevent tabbing into tabindex -1 subtrees ([#1255](https://github.com/salesforce/lwc/issues/1255)) ([5eeb2a1](https://github.com/salesforce/lwc/commit/5eeb2a1c515fd3acca788ce32c923560b0615913))
* **template-compiler:** remove HTML attributes validation ([#1247](https://github.com/salesforce/lwc/issues/1247)) ([990063a](https://github.com/salesforce/lwc/commit/990063aa10e4dd648f943c8912f6035cfe82e995))



## [0.40.1](https://github.com/salesforce/lwc/compare/v0.40.0...v0.40.1) (2019-05-21)


### Bug Fixes

* **compiler:** stop reporting warnings on absolute imports ([#1238](https://github.com/salesforce/lwc/issues/1238)) ([57210ae](https://github.com/salesforce/lwc/commit/57210ae3ee515630500a75a21e09476ae2bf59a3))
* **synthetic-shadow:** htmlcollection and nodelist ([#1232](https://github.com/salesforce/lwc/issues/1232)) ([7bc96eb](https://github.com/salesforce/lwc/commit/7bc96eb9702f625e2dfecf17b46852bfb587e306))
* isGlobalPatchingSkipped on iframe document ([#1251](https://github.com/salesforce/lwc/issues/1251)) ([dd9ff2a](https://github.com/salesforce/lwc/commit/dd9ff2a06645d98c90e09f84ca4ba2b6994371fe))


### Features

* **jest-transformer:** add transform for @salesforce/client ([#1235](https://github.com/salesforce/lwc/issues/1235)) ([fbf9324](https://github.com/salesforce/lwc/commit/fbf932430044474dc1e869c23a7e3ca114f40eb2))
* **template-compiler:** disallow <style> inside <template> ([a3eae33](https://github.com/salesforce/lwc/commit/a3eae33599b63ed4d6664638f4404ceef8806c93))
* **template-compiler:** remove lwc-depracated:is ([#1237](https://github.com/salesforce/lwc/issues/1237)) ([149d1f6](https://github.com/salesforce/lwc/commit/149d1f61996a3d34f39c50d99626ee8dec83da8b))



# [0.40.0](https://github.com/salesforce/lwc/compare/v0.39.1...v0.40.0) (2019-05-15)


### Bug Fixes

* **engine:** fixes [#1199](https://github.com/salesforce/lwc/issues/1199) and [#1198](https://github.com/salesforce/lwc/issues/1198) - disconnecting bug ([#1202](https://github.com/salesforce/lwc/issues/1202)) ([#1209](https://github.com/salesforce/lwc/issues/1209)) ([01be207](https://github.com/salesforce/lwc/commit/01be207b8c8cc93d09a2e70c573108f3d6b6751a))
* prevent tabbing into subtrees with tabindex -1 ([#1206](https://github.com/salesforce/lwc/issues/1206)) ([9f273f5](https://github.com/salesforce/lwc/commit/9f273f559ffb3e5065cb161eabc3341a2f82a38f))
* provide a way to disable document patching ([#1221](https://github.com/salesforce/lwc/issues/1221)) ([f36bbce](https://github.com/salesforce/lwc/commit/f36bbcea07cd329f5524a3310f1d838e662cb8af))
* refactor mutation observer polyfill to fix memory leaks ([#1200](https://github.com/salesforce/lwc/issues/1200)) ([c2b68ed](https://github.com/salesforce/lwc/commit/c2b68ed559414d1fe91aff590bbac38227adc187))
* **engine:** membrane should be used on the bridge instead of cmp setter ([#1134](https://github.com/salesforce/lwc/issues/1134)) ([7265f3d](https://github.com/salesforce/lwc/commit/7265f3ddaf2a7d14aef35c34bedc3331fa5f86b7))
* **synthetic-shadow:** types and bugs in preparation for final split ([#1192](https://github.com/salesforce/lwc/issues/1192)) ([6d2de54](https://github.com/salesforce/lwc/commit/6d2de549ecbfac926bd49b82fc2a15aeb625a6ab))


### Features

* **babel:** add filename/location to error ([#1208](https://github.com/salesforce/lwc/issues/1208)) ([eac328a](https://github.com/salesforce/lwc/commit/eac328ae25942913184dce95cc9e507b48a2e251))
* CSS only modules ([#1211](https://github.com/salesforce/lwc/issues/1211)) ([a7c563e](https://github.com/salesforce/lwc/commit/a7c563e74dc304f5b5400822801cc37f30c50217))
* **template-compiler:** remove metadata ([#1186](https://github.com/salesforce/lwc/issues/1186)) ([692a805](https://github.com/salesforce/lwc/commit/692a8052b9f3e6fa911b886fcf1168743cbc5a6e))


### Reverts

* Revert "fix: prevent tabbing into subtrees with tabindex -1 (#1206)" (#1233) ([040c22a](https://github.com/salesforce/lwc/commit/040c22a4b0633575935a35d830553fcc431b277f)), closes [#1206](https://github.com/salesforce/lwc/issues/1206) [#1233](https://github.com/salesforce/lwc/issues/1233)



## [0.39.1](https://github.com/salesforce/lwc/compare/v0.39.0...v0.39.1) (2019-05-02)



# [0.39.0](https://github.com/salesforce/lwc/compare/v0.38.1...v0.39.0) (2019-05-01)



## [0.38.1](https://github.com/salesforce/lwc/compare/v0.38.0...v0.38.1) (2019-04-30)



# [0.38.0](https://github.com/salesforce/lwc/compare/v0.37.2...v0.38.0) (2019-04-30)


### Bug Fixes

* add `allow` as a valid iframe attribute ([#1156](https://github.com/salesforce/lwc/issues/1156)) ([74a42fc](https://github.com/salesforce/lwc/commit/74a42fc743802e44383350d240f6b7c4d56bcabb))
* fix event tests to be shadow aware ([#1182](https://github.com/salesforce/lwc/issues/1182)) ([3cd1191](https://github.com/salesforce/lwc/commit/3cd119162baef2a8ec751f987cc578e52a9b1a36))
* **compiler:** add default export support and enable strict mode ([#1175](https://github.com/salesforce/lwc/issues/1175)) ([a429824](https://github.com/salesforce/lwc/commit/a4298242c1a8ec9266b809898a7ce92d43ff1aa5))
* **compiler:** don't use project-wide config ([#1163](https://github.com/salesforce/lwc/issues/1163)) ([1477d56](https://github.com/salesforce/lwc/commit/1477d56275cab6ba33ae45bc18a726434fa83410))
* **engine:** add instaceof check workaround ([#1165](https://github.com/salesforce/lwc/issues/1165)) ([5490be7](https://github.com/salesforce/lwc/commit/5490be707241c437d9e782dddfd296d2dc6bcb3c))
* **engine:** restrict access to ShadowRoot.dispatchEvent ([#1176](https://github.com/salesforce/lwc/issues/1176)) ([01a6506](https://github.com/salesforce/lwc/commit/01a65060fe321c5eb1c7b305aaad71641dfcdf72))
* **engine:** supporting objects with null prototype in iterators ([#1152](https://github.com/salesforce/lwc/issues/1152)) ([7c5f264](https://github.com/salesforce/lwc/commit/7c5f2642ce2b03f96ac87b5a56b9e682ab17124c))
* **resolver:** use require.resolve.paths(); avoid require for json ([#1194](https://github.com/salesforce/lwc/issues/1194)) ([7ef45df](https://github.com/salesforce/lwc/commit/7ef45df2402fb8a4691878c23e95faa73cb971e1))
* incorrect import in dist type in @lwc/compiler ([#1196](https://github.com/salesforce/lwc/issues/1196)) ([0ed106b](https://github.com/salesforce/lwc/commit/0ed106bc1dc387b8470b0c734f2843f828968ee5))


### Features

* **compiler:** expose transformSync method ([#1174](https://github.com/salesforce/lwc/issues/1174)) ([ebeb23a](https://github.com/salesforce/lwc/commit/ebeb23a2a4d2b5ce2a30400f1978e0f30aa93df7))


### Performance Improvements

* optimize module resolution ([#1183](https://github.com/salesforce/lwc/issues/1183)) ([81ffabf](https://github.com/salesforce/lwc/commit/81ffabf2ad19ee34b02d5bd7022fa27bae5095b8)), closes [#1162](https://github.com/salesforce/lwc/issues/1162)



## [0.37.2](https://github.com/salesforce/lwc/compare/v0.37.1...v0.37.2) (2019-04-01)


### Bug Fixes

* **engine:** Make engine more resilient to invalid constructors ([#1121](https://github.com/salesforce/lwc/issues/1121)) ([fee643c](https://github.com/salesforce/lwc/commit/fee643cc7ccada334cb858625ec509ab04312dc1))
* **module-resolver:** protect against invalid package.json ([#1146](https://github.com/salesforce/lwc/issues/1146)) ([906ac64](https://github.com/salesforce/lwc/commit/906ac649a0ef951bca6314ca76c86a44119e2939))
* **template-compiler:** restrict srcdoc attribute on all iframe element ([#1137](https://github.com/salesforce/lwc/issues/1137)) ([3aff1a5](https://github.com/salesforce/lwc/commit/3aff1a506a989a366281e3db648a18c25fe65d54))
* unify the descriptor creation process for restrictions ([#1144](https://github.com/salesforce/lwc/issues/1144)) ([bfb577e](https://github.com/salesforce/lwc/commit/bfb577e9b3b15bff50897869e964a15b025be884))
* use patched MutationObserver to key portal elements ([#1147](https://github.com/salesforce/lwc/issues/1147)) ([5c97354](https://github.com/salesforce/lwc/commit/5c97354953a9217869625507c53a6de8a14aa101)), closes [#1022](https://github.com/salesforce/lwc/issues/1022)


### Features

* allow typescript file extension ([#1135](https://github.com/salesforce/lwc/issues/1135)) ([4acd1d3](https://github.com/salesforce/lwc/commit/4acd1d3ec45fe9752fa299a0ef5808b2ed7f85b7))



## [0.37.1](https://github.com/salesforce/lwc/compare/v0.37.0...v0.37.1) (2019-03-27)


### Bug Fixes

* **babel-plugin-component:** correct class member decorator validation  ([#1122](https://github.com/salesforce/lwc/issues/1122)) ([22ec3d5](https://github.com/salesforce/lwc/commit/22ec3d5c28a2b50184c4066845fa0dcbbc58b594))
* use observable-membrane v0.26.1 ([#1111](https://github.com/salesforce/lwc/issues/1111)) ([df0e91f](https://github.com/salesforce/lwc/commit/df0e91f48a999d204c58bdc20a3d72d4c2817272))
* **engine:** prevent focus events when engine manages focus ([#1116](https://github.com/salesforce/lwc/issues/1116)) ([477c5cf](https://github.com/salesforce/lwc/commit/477c5cf4484d8d47d5e1c9777fecc2aaf9d99f15))
* **jest-transformer:** add babel-preset-jest dependency ([#1112](https://github.com/salesforce/lwc/issues/1112)) ([1f12803](https://github.com/salesforce/lwc/commit/1f128037b5e5b5acc0bc590e5719ad64bfbba8df))



# [0.37.0](https://github.com/salesforce/lwc/compare/v0.36.0...v0.37.0) (2019-03-08)


### Bug Fixes

* include fragment only urls when scoping idrefs ([#1085](https://github.com/salesforce/lwc/issues/1085)) ([4d54d08](https://github.com/salesforce/lwc/commit/4d54d08be1791de49af3af7e3c64a7b6c93ef3e8))
* **babel-plugin-component:** validate wire adapter import ([#1096](https://github.com/salesforce/lwc/issues/1096)) ([e3525d5](https://github.com/salesforce/lwc/commit/e3525d5b464901654fab899b5eb52558ffb0c40a))
* patch behavior of Node.prototype.getRootNode ([#1083](https://github.com/salesforce/lwc/issues/1083)) ([9f998e8](https://github.com/salesforce/lwc/commit/9f998e8cfc604840616e91e94e48f461b2f94cd0))


### Features

* **style-compiler:** add support for :dir pseudo class ([#1099](https://github.com/salesforce/lwc/issues/1099)) ([fe3206c](https://github.com/salesforce/lwc/commit/fe3206c9f33e7d7badc7789041e7befe98a19437))


### Performance Improvements

* **engine:** optimize vm object to initialize all the fields in advance ([#1098](https://github.com/salesforce/lwc/issues/1098)) ([8b0f9d3](https://github.com/salesforce/lwc/commit/8b0f9d395e18fbfffe96f3541d5c8a5a1eb1f5e2))



# [0.36.0](https://github.com/salesforce/lwc/compare/v0.35.12...v0.36.0) (2019-03-06)


### Bug Fixes

* **jest-transformer:** apex import mocks to use named functions ([#1093](https://github.com/salesforce/lwc/issues/1093)) ([c2c1097](https://github.com/salesforce/lwc/commit/c2c1097885e7bd5a413ae8512ba476de4ccc1bae))
* **wire-service:** add lifecycle hook guards ([#1092](https://github.com/salesforce/lwc/issues/1092)) ([dfa87d1](https://github.com/salesforce/lwc/commit/dfa87d1703c5dc2059109825afd43da89520279f))



## [0.35.12](https://github.com/salesforce/lwc/compare/v0.35.11...v0.35.12) (2019-03-05)


### Bug Fixes

* properly exit the state entered when clicking into shadows ([#1082](https://github.com/salesforce/lwc/issues/1082)) ([d20fdda](https://github.com/salesforce/lwc/commit/d20fddabeabd71cf4c18a4e3128b6f3f2f71e3ab))
* **engine:** error boundary fix for non-inserted slotted custom elements ([#1090](https://github.com/salesforce/lwc/issues/1090)) ([3b3c278](https://github.com/salesforce/lwc/commit/3b3c278249e7751aea87e8e0b877eaa231dde808))



## [0.35.11](https://github.com/salesforce/lwc/compare/v0.35.10...v0.35.11) (2019-02-27)


### Bug Fixes

* **engine:** Error boundary improvement ([#937](https://github.com/salesforce/lwc/issues/937)) ([796997d](https://github.com/salesforce/lwc/commit/796997d15a985646626da43e03b70f01e0044be8))
* **test-utils:** deprecate getShadowRoot API ([#1069](https://github.com/salesforce/lwc/issues/1069)) ([59298cd](https://github.com/salesforce/lwc/commit/59298cd9789d1beca3c32529eaa56e7cf1de3466))


### Features

* patch MutationObserver to be aware of synthetic shadow dom ([#1046](https://github.com/salesforce/lwc/issues/1046)) ([e80c0cc](https://github.com/salesforce/lwc/commit/e80c0ccae5decd42872b8e2d544c8e2f66e6bce0))



## [0.35.10](https://github.com/salesforce/lwc/compare/v0.35.9...v0.35.10) (2019-02-26)


### Bug Fixes

* update types for shadow root ([#1077](https://github.com/salesforce/lwc/issues/1077)) ([7d4dee2](https://github.com/salesforce/lwc/commit/7d4dee29ebe4ca66b02cbc3495e6e5c7147c13f0))



## [0.35.9](https://github.com/salesforce/lwc/compare/v0.35.7...v0.35.9) (2019-02-22)


### Bug Fixes

* **engine:** component name in performance marks ([#1021](https://github.com/salesforce/lwc/issues/1021)) ([25ed4c2](https://github.com/salesforce/lwc/commit/25ed4c21fe9aa0cef2e583b20493b0ae9cc8f830))
* **engine:** Node.compareDocumentPosition spec implication issues ([#1063](https://github.com/salesforce/lwc/issues/1063)) ([cbd210e](https://github.com/salesforce/lwc/commit/cbd210ed98dbe1abef814930de1ae15efac12450))
* move mutation observer to its own modules ([#1068](https://github.com/salesforce/lwc/issues/1068)) ([812c0ce](https://github.com/salesforce/lwc/commit/812c0cef5854ab2fdef0cfa8161b86939d5b2cad))


### Features

* **compiler:** remove import locations metadata ([#1047](https://github.com/salesforce/lwc/issues/1047)) ([80e6816](https://github.com/salesforce/lwc/commit/80e6816a6c14cfba983522930f29087dd676ef94))
* add apexContinuation transformer ([#1074](https://github.com/salesforce/lwc/issues/1074)) ([01ce6c3](https://github.com/salesforce/lwc/commit/01ce6c3e3c1de722371e1e152586e88de6006f7c))



## [0.35.7](https://github.com/salesforce/lwc/compare/v0.35.6...v0.35.7) (2019-02-14)


### Bug Fixes

* **style-compiler:** invalid at-rules transformations ([#1042](https://github.com/salesforce/lwc/issues/1042)) ([d97cc22](https://github.com/salesforce/lwc/commit/d97cc22cf5bef841f77132827d040aa4869f9165))


### Features

* **babel-plugin-component:** remove decorator meta collection ([#1016](https://github.com/salesforce/lwc/issues/1016)) ([f5a3a71](https://github.com/salesforce/lwc/commit/f5a3a71591bb39ef3f40d7aefc94b9d2c3f061aa))



## [0.35.6](https://github.com/salesforce/lwc/compare/v0.35.5...v0.35.6) (2019-02-06)


### Bug Fixes

* fix condition for extracting children getter ([#1039](https://github.com/salesforce/lwc/issues/1039)) ([b9a3237](https://github.com/salesforce/lwc/commit/b9a3237c080ec83ec8223b33eaccf440cac4dbb3))



## [0.35.5](https://github.com/salesforce/lwc/compare/v0.35.4...v0.35.5) (2019-01-28)


### Bug Fixes

* **engine:** aria reflection new prop and typo ([#1012](https://github.com/salesforce/lwc/issues/1012)) ([87d211c](https://github.com/salesforce/lwc/commit/87d211cadeb2155536bb1f0aedef39abc3f3b5ea))
* **engine:** fixes issue [#972](https://github.com/salesforce/lwc/issues/972) - getRootNode on shadows ([#1002](https://github.com/salesforce/lwc/issues/1002)) ([bd77365](https://github.com/salesforce/lwc/commit/bd773650e939fb2942d3566d5e799509b4ee56b7))
* **engine:** issue [#976](https://github.com/salesforce/lwc/issues/976) ShadowRoot.contains() ([#1000](https://github.com/salesforce/lwc/issues/1000)) ([f8423e8](https://github.com/salesforce/lwc/commit/f8423e8141cf20b3cfbf569530cf63ed275e576f))
* **engine:** issue [#988](https://github.com/salesforce/lwc/issues/988) ShadowRoot unknown properties ([#999](https://github.com/salesforce/lwc/issues/999)) ([fbfa0b5](https://github.com/salesforce/lwc/commit/fbfa0b59e56ab070fe899c69d5326a376dbbb177))
* **engine:** issue [#989](https://github.com/salesforce/lwc/issues/989) enumerable in shadowRoot ([#998](https://github.com/salesforce/lwc/issues/998)) ([9aab030](https://github.com/salesforce/lwc/commit/9aab0301de43af75209d76f6b3ce7ab65e621d6f))
* **engine:** issue 990 textContent and innerHTML restrictions ([#1001](https://github.com/salesforce/lwc/issues/1001)) ([514c1f5](https://github.com/salesforce/lwc/commit/514c1f5e61c61d20d643be884d497afe2b4c997a))
* **engine:** types definition update fixes [#1006](https://github.com/salesforce/lwc/issues/1006) ([#1013](https://github.com/salesforce/lwc/issues/1013)) ([ee0ad9c](https://github.com/salesforce/lwc/commit/ee0ad9c0d34053f95e1ffaf54a7cb4c26486d457))
* ownerkey lookup of root ele manually injected into another lwc ele ([#1018](https://github.com/salesforce/lwc/issues/1018)) ([82669bb](https://github.com/salesforce/lwc/commit/82669bbe935aee21c590753667c60f16ffa0cf7e))


### Features

* **engine:** remove non-trackable object warning ([#1003](https://github.com/salesforce/lwc/issues/1003)) ([735e8ea](https://github.com/salesforce/lwc/commit/735e8ea9ff2e84e63705891803be57b55b90ff37))


### Reverts

* Revert "Revert "fix(engine): implement composedPath, srcElement and path for events (#859)" (#983)" (#993) ([8c5076e](https://github.com/salesforce/lwc/commit/8c5076e6639d469b900068eed201dd62d2c4a88a)), closes [#859](https://github.com/salesforce/lwc/issues/859) [#983](https://github.com/salesforce/lwc/issues/983) [#993](https://github.com/salesforce/lwc/issues/993)



## [0.35.4](https://github.com/salesforce/lwc/compare/v0.35.2...v0.35.4) (2019-01-19)


### Reverts

* Revert "fix(engine): implement composedPath, srcElement and path for events (#859)" (#983) ([2da65c1](https://github.com/salesforce/lwc/commit/2da65c17438c3fcfd7aa69dd6b5d0a56d67a9814)), closes [#859](https://github.com/salesforce/lwc/issues/859) [#983](https://github.com/salesforce/lwc/issues/983)



## [0.35.2](https://github.com/salesforce/lwc/compare/v0.35.1...v0.35.2) (2019-01-18)


### Bug Fixes

* **engine:** closes [#958](https://github.com/salesforce/lwc/issues/958) after fixing parentElement ref in slotted node ([#959](https://github.com/salesforce/lwc/issues/959)) ([0ec65ea](https://github.com/salesforce/lwc/commit/0ec65ea78ac26f62292362ae1c0aceb3a847bfb9)), closes [#967](https://github.com/salesforce/lwc/issues/967)
* **engine:** correct error type from Reference to Type ([#945](https://github.com/salesforce/lwc/issues/945)) ([42fd8d7](https://github.com/salesforce/lwc/commit/42fd8d7959398fc128b3d41c9d37842094a01e95))
* **engine:** fixes [#973](https://github.com/salesforce/lwc/issues/973) to support cloneNode with ie11 devtool comment ([#974](https://github.com/salesforce/lwc/issues/974)) ([4931eec](https://github.com/salesforce/lwc/commit/4931eec29e9c95ed6bd8d4c6e3766a67c785ff2f))
* **engine:** fixes issue [#129](https://github.com/salesforce/lwc/issues/129) - removal of dangerousObjectMutation ([#831](https://github.com/salesforce/lwc/issues/831)) ([b65c1f6](https://github.com/salesforce/lwc/commit/b65c1f615c07976954b179a02a0fa43341876bff))
* **engine:** implement composedPath, srcElement and path for events ([#859](https://github.com/salesforce/lwc/issues/859)) ([c415ece](https://github.com/salesforce/lwc/commit/c415ece7ccf393ad8587d3f4d03c51e8c1b5a3a4))
* **engine:** to use the later version of observable membrane ([#848](https://github.com/salesforce/lwc/issues/848)) ([9f63a10](https://github.com/salesforce/lwc/commit/9f63a103a8e56a51535e9db224465196ca7105f0))
* should always have access to slotted elements ([#939](https://github.com/salesforce/lwc/issues/939)) ([b767131](https://github.com/salesforce/lwc/commit/b76713103349b9e82c62810b40c4d47f81b40dce))


### Features

* **compiler:** improve error message consistency ([#969](https://github.com/salesforce/lwc/issues/969)) ([5c16e22](https://github.com/salesforce/lwc/commit/5c16e2293196a3310e0b7ed69cec22097174f10d))
* **engine:** improve createElement() second parameter error messages ([#944](https://github.com/salesforce/lwc/issues/944)) ([8dc263b](https://github.com/salesforce/lwc/commit/8dc263bc077b83eb3a5beb98e2b392fbfadb629f))



## [0.35.1](https://github.com/salesforce/lwc/compare/v0.34.0...v0.35.1) (2019-01-11)


### Bug Fixes

* **engine:** regular dom nodes can use object type event listeners ([#943](https://github.com/salesforce/lwc/issues/943)) ([adf3504](https://github.com/salesforce/lwc/commit/adf3504ae414d6230c2c5a0407feea12241a0e17))



# [0.34.0](https://github.com/salesforce/lwc/compare/v0.33.28-1...v0.34.0) (2019-01-10)


### Bug Fixes

* **engine:** patching events from lwc to be deterministic ([#870](https://github.com/salesforce/lwc/issues/870)) ([8d3fc9f](https://github.com/salesforce/lwc/commit/8d3fc9f334ac3757ba51412973749c4a3351d289))


### Features

* **compiler:** add bundle entry name + filenames case validation ([#902](https://github.com/salesforce/lwc/issues/902)) ([39b1e00](https://github.com/salesforce/lwc/commit/39b1e00256a3e2601da8e88158b441f4b7b281a9))



## [0.33.28-1](https://github.com/salesforce/lwc/compare/v0.33.28-alpha3...v0.33.28-1) (2019-01-09)



## [0.33.28-alpha3](https://github.com/salesforce/lwc/compare/v0.33.26...v0.33.28-alpha3) (2019-01-09)


### Bug Fixes

* **engine:** to show shadow in IE11 devtool DOM explorer ([#904](https://github.com/salesforce/lwc/issues/904)) ([6e2817f](https://github.com/salesforce/lwc/commit/6e2817f2f6696968f1f8eb2770cea110b1748315))
* **jest-transformer:** update @salesforce/apex transform ([#924](https://github.com/salesforce/lwc/issues/924)) ([a3d6af5](https://github.com/salesforce/lwc/commit/a3d6af567a67cebc2bebbf2eb9da12b2734579ca))
* Add crossorigin as valid img tag attribute ([#918](https://github.com/salesforce/lwc/issues/918)) ([e861600](https://github.com/salesforce/lwc/commit/e8616009000d6fc6952c8ff878de47b5f3e03d5d))


### Features

* **rollup-plugin:** add stylesheetConfig to rollup-plugin options ([#921](https://github.com/salesforce/lwc/issues/921)) ([ca43c83](https://github.com/salesforce/lwc/commit/ca43c83e1108a72f96ac76681b23eff4e5cc958c)), closes [#920](https://github.com/salesforce/lwc/issues/920)



## [0.33.26](https://github.com/salesforce/lwc/compare/v0.33.25...v0.33.26) (2018-12-21)


### Bug Fixes

* **compiler:** remove misleading and useless stack info on CompilerError ([#893](https://github.com/salesforce/lwc/issues/893)) ([860da4f](https://github.com/salesforce/lwc/commit/860da4fc15e67f8140ab6b3554d75bcd34edbe4d))
* **module-resolver:** wrong path separator in glob call ([#895](https://github.com/salesforce/lwc/issues/895)) ([7f1f954](https://github.com/salesforce/lwc/commit/7f1f954a10dbabb2d442c19580d88396ec43f77a))


### Features

* no production assert tslint rule ([#894](https://github.com/salesforce/lwc/issues/894)) ([1e1aa91](https://github.com/salesforce/lwc/commit/1e1aa913b03c093cd918b2d00dc80ca9791b209b))



## [0.33.25](https://github.com/salesforce/lwc/compare/v0.33.24...v0.33.25) (2018-12-14)


### Bug Fixes

* avoid directly extending constructors that are objects in ie11 ([#880](https://github.com/salesforce/lwc/issues/880)) ([04dbd20](https://github.com/salesforce/lwc/commit/04dbd20c2c5fc74233e05cfb6b0fa3c7dccbe4d2))



## [0.33.24](https://github.com/salesforce/lwc/compare/v0.33.23...v0.33.24) (2018-12-13)



## [0.33.23](https://github.com/salesforce/lwc/compare/v0.33.22...v0.33.23) (2018-12-13)



## [0.33.22](https://github.com/salesforce/lwc/compare/v0.33.21...v0.33.22) (2018-12-13)



## [0.33.21](https://github.com/salesforce/lwc/compare/v0.33.20...v0.33.21) (2018-12-13)



## [0.33.20](https://github.com/salesforce/lwc/compare/v0.33.19...v0.33.20) (2018-12-13)



## [0.33.19](https://github.com/salesforce/lwc/compare/v0.33.18...v0.33.19) (2018-12-13)



## [0.33.18](https://github.com/salesforce/lwc/compare/v0.33.17...v0.33.18) (2018-12-13)


### Bug Fixes

* **engine:** closes [#871](https://github.com/salesforce/lwc/issues/871) - support for svg manual injection ([#872](https://github.com/salesforce/lwc/issues/872)) ([4851400](https://github.com/salesforce/lwc/commit/4851400b36b61e20223e6c0c5a7db35540ac6c17))
* error when 2 perf markers are stacked ([#865](https://github.com/salesforce/lwc/issues/865)) ([1bce3c7](https://github.com/salesforce/lwc/commit/1bce3c7482c1a900dc6b4ead429c205b2b574216))
* errors package as hard dep in jest-transformer ([#884](https://github.com/salesforce/lwc/issues/884)) ([9d8717c](https://github.com/salesforce/lwc/commit/9d8717c96467a4594f9f775370f915d3ab31edf3))



## [0.33.17](https://github.com/salesforce/lwc/compare/v0.33.16...v0.33.17) (2018-12-12)


### Bug Fixes

* **engine:** removing lwc:dom error when ownerkey is not defined ([#879](https://github.com/salesforce/lwc/issues/879)) ([b68a72a](https://github.com/salesforce/lwc/commit/b68a72a1cab48b5a741200df386c34bdb2eec420))



## [0.33.16](https://github.com/salesforce/lwc/compare/v0.33.15...v0.33.16) (2018-12-07)



## [0.33.15](https://github.com/salesforce/lwc/compare/v0.33.14...v0.33.15) (2018-12-06)


### Bug Fixes

* **compiler:** convert placeholder error codes into real numbers ([#877](https://github.com/salesforce/lwc/issues/877)) ([ae92210](https://github.com/salesforce/lwc/commit/ae92210a890d2decfc0ff525399211d3cdb62d5d))



## [0.33.14](https://github.com/salesforce/lwc/compare/v0.33.13...v0.33.14) (2018-12-06)


### Features

* secure wrap xlink ([#875](https://github.com/salesforce/lwc/issues/875)) ([fcfbe3f](https://github.com/salesforce/lwc/commit/fcfbe3fe3c8c636fc0610e68ee5e9e6077b130ed))



## [0.33.13](https://github.com/salesforce/lwc/compare/v0.33.12...v0.33.13) (2018-12-06)



## [0.33.12](https://github.com/salesforce/lwc/compare/v0.33.11...v0.33.12) (2018-12-05)



## [0.33.11](https://github.com/salesforce/lwc/compare/v0.33.10...v0.33.11) (2018-12-05)


### Bug Fixes

* **engine:** bunch of broken tests ([#853](https://github.com/salesforce/lwc/issues/853)) ([94e6d2f](https://github.com/salesforce/lwc/commit/94e6d2f69cd9e4f1a2dcff2154bb2a5449953c50))
* hide component to vm mapping from user ([#860](https://github.com/salesforce/lwc/issues/860)) ([5010713](https://github.com/salesforce/lwc/commit/5010713c7feade87e0c3d6737da7f76bb2d41731))
* restrict script in MathML and remove srcdoc on iframe ([#867](https://github.com/salesforce/lwc/issues/867)) ([11d906f](https://github.com/salesforce/lwc/commit/11d906f0523c3c175812588a864440c700de4d5d))
* **engine:** deep manual dom elements fix  ([#874](https://github.com/salesforce/lwc/issues/874)) ([041eb1e](https://github.com/salesforce/lwc/commit/041eb1e21c18a38be4184e3eaadb2d646692b1f4))



## [0.33.10](https://github.com/salesforce/lwc/compare/v0.33.9...v0.33.10) (2018-11-29)


### Bug Fixes

* **compiler:** include start and length with diagnostics ([#856](https://github.com/salesforce/lwc/issues/856)) ([b4fad21](https://github.com/salesforce/lwc/commit/b4fad2162c4530b89b23fef030bc833d344149b9))
* minor guard ([#863](https://github.com/salesforce/lwc/issues/863)) ([f439c16](https://github.com/salesforce/lwc/commit/f439c1613d1bcce91e2b9a5ad7172ee20f178118))
* **engine:** [218] implementation for clone node ([#864](https://github.com/salesforce/lwc/issues/864)) ([0f41231](https://github.com/salesforce/lwc/commit/0f41231406fe3cb6049fb8fe6452767c4bcd81e2))
* **engine:** retargeting elementFromPoint without elementsFromPoint ([#866](https://github.com/salesforce/lwc/issues/866)) ([c665b9a](https://github.com/salesforce/lwc/commit/c665b9a9dd8ada73e66b3769f86b00a75e45253e))



## [0.33.9](https://github.com/salesforce/lwc/compare/v0.33.8...v0.33.9) (2018-11-26)



## [0.33.8](https://github.com/salesforce/lwc/compare/v0.33.7...v0.33.8) (2018-11-26)


### Bug Fixes

* Prevent Javascript injection via ${} in the CSS ([#851](https://github.com/salesforce/lwc/issues/851)) ([6760e2a](https://github.com/salesforce/lwc/commit/6760e2a08f20869339b3fade86d50740463c8760))
* **engine:** close [#849](https://github.com/salesforce/lwc/issues/849) by implementing move hook ([#852](https://github.com/salesforce/lwc/issues/852)) ([6c05d12](https://github.com/salesforce/lwc/commit/6c05d126e0769cddd8683d9c5037dd03049e556c))
* **engine:** relatedTarget might not be present ([#857](https://github.com/salesforce/lwc/issues/857)) ([16528a5](https://github.com/salesforce/lwc/commit/16528a5332c0e190072b3a847ddad96cefa7d696))
* **engine:** retarget to null instead of undefined ([#850](https://github.com/salesforce/lwc/issues/850)) ([058e40c](https://github.com/salesforce/lwc/commit/058e40c77ad7f78b89f184058640d64739ed3c8c))



## [0.33.7](https://github.com/salesforce/lwc/compare/v0.33.6...v0.33.7) (2018-11-20)



## [0.33.6](https://github.com/salesforce/lwc/compare/v0.33.5...v0.33.6) (2018-11-19)


### Bug Fixes

* css minification ordering issue ([#840](https://github.com/salesforce/lwc/issues/840)) ([2f579f6](https://github.com/salesforce/lwc/commit/2f579f6dcec9a6ce9208013185a719422013c955))
* **engine:** fixes error when switching from tabindex -1 to 0 ([#844](https://github.com/salesforce/lwc/issues/844)) ([a16b399](https://github.com/salesforce/lwc/commit/a16b399c4ac29fd1bcab0ca4dc6cfde5678955fb))
* **engine:** relatedTarget event regargeting ([#842](https://github.com/salesforce/lwc/issues/842)) ([2906ed8](https://github.com/salesforce/lwc/commit/2906ed8ccc839f6ea06a3af26f782dca64a842e1))
* import inline styles ([#843](https://github.com/salesforce/lwc/issues/843)) ([c9d1809](https://github.com/salesforce/lwc/commit/c9d180943c9983eba328b07a0007c558f2ce70f4))
* remove debugger statament ([#845](https://github.com/salesforce/lwc/issues/845)) ([6c1ce57](https://github.com/salesforce/lwc/commit/6c1ce571495097c9f2c2afb5110c4a906a852344))


### Performance Improvements

* upgrade compat ([#847](https://github.com/salesforce/lwc/issues/847)) ([9f1ea77](https://github.com/salesforce/lwc/commit/9f1ea77fff4359ed77dbfdabfc29100eee6cc043))



## [0.33.5](https://github.com/salesforce/lwc/compare/v0.33.4...v0.33.5) (2018-11-15)



## [0.33.4](https://github.com/salesforce/lwc/compare/v0.33.3...v0.33.4) (2018-11-15)



## [0.33.3](https://github.com/salesforce/lwc/compare/v0.33.2...v0.33.3) (2018-11-15)


### Bug Fixes

* parse a-trules correctly in CSS ([#839](https://github.com/salesforce/lwc/issues/839)) ([9c1da4d](https://github.com/salesforce/lwc/commit/9c1da4d1c01a2bee09f165707a8be21935b9fefa))


### Features

* **compiler:** collect default value metadata for [@api](https://github.com/api) properties ([#816](https://github.com/salesforce/lwc/issues/816)) ([c64e4b3](https://github.com/salesforce/lwc/commit/c64e4b3348f0526af81aec4f518f8220227c113a))



## [0.33.2](https://github.com/salesforce/lwc/compare/v0.33.1...v0.33.2) (2018-11-14)


### Bug Fixes

* return correct target when handler is document/body owned ([#836](https://github.com/salesforce/lwc/issues/836)) ([5203d43](https://github.com/salesforce/lwc/commit/5203d4335b9e2e10f0fb3c119a598b6eb9990a71))
* typescript definitions for lwc and wire roots ([#835](https://github.com/salesforce/lwc/issues/835)) ([3217ce9](https://github.com/salesforce/lwc/commit/3217ce9dc19a0c70894fbef8f280040d66b1b925))
* **engine:** loopholes in our synthetic shadow for local traversing ([#779](https://github.com/salesforce/lwc/issues/779)) ([fc6dc9c](https://github.com/salesforce/lwc/commit/fc6dc9c54182eb881450c953a416a8df00992780))


### Features

* **template-compiler:** remove "is" support and add lwc-deprecated:is ([#834](https://github.com/salesforce/lwc/issues/834)) ([f15ad9f](https://github.com/salesforce/lwc/commit/f15ad9f891d822d6fc272df8432a8724e2e94a01))



## [0.33.1](https://github.com/salesforce/lwc/compare/v0.33.0...v0.33.1) (2018-11-13)


### Bug Fixes

* apply implicit logic to jest resolver ([#825](https://github.com/salesforce/lwc/issues/825)) ([c5554fd](https://github.com/salesforce/lwc/commit/c5554fd451d6e1fb3a09f4f2de824b8b816d23e5))
* publicPropsTransform ([#833](https://github.com/salesforce/lwc/issues/833)) ([67008de](https://github.com/salesforce/lwc/commit/67008defb8e94a3ae99b6e82e46a6fb35b4add7c))
* serialization ie11 ([#828](https://github.com/salesforce/lwc/issues/828)) ([714c4a8](https://github.com/salesforce/lwc/commit/714c4a8ef78e02760b5725c9d5a67b35447cee5c))



# [0.33.0](https://github.com/salesforce/lwc/compare/v0.32.1...v0.33.0) (2018-11-13)


### Bug Fixes

* error when document.activeElement is null ([#823](https://github.com/salesforce/lwc/issues/823)) ([5c70269](https://github.com/salesforce/lwc/commit/5c702698152a7c16120716a64f0c3ced22bb115c))


### Features

* dynamic scoped ids ([#787](https://github.com/salesforce/lwc/issues/787)) ([e1e85cc](https://github.com/salesforce/lwc/commit/e1e85ccc6c1bbe968e721c9dac6c3d6606a42207))



## [0.32.1](https://github.com/salesforce/lwc/compare/v0.31.6...v0.32.1) (2018-11-12)


### Bug Fixes

* remove prod perf markers on wc.ts ([#811](https://github.com/salesforce/lwc/issues/811)) ([074d522](https://github.com/salesforce/lwc/commit/074d522f5def505f230d7d109432c286a1f80d07))


### Features

* Allow for implicit/explicit resolution ([#813](https://github.com/salesforce/lwc/issues/813)) ([738956f](https://github.com/salesforce/lwc/commit/738956f0d677d8d2427047e6ab07f02a6b0fa4a9))



## [0.31.6](https://github.com/salesforce/lwc/compare/v0.31.4...v0.31.6) (2018-11-09)


### Bug Fixes

* **engine:** fix for delegatesFocus with tabindex=0 ([#812](https://github.com/salesforce/lwc/issues/812)) ([81f0dbd](https://github.com/salesforce/lwc/commit/81f0dbd5488ee1852ff1854a6e4009199df28708))
* **engine:** fix more ie11 flappers ([#814](https://github.com/salesforce/lwc/issues/814)) ([60f17bc](https://github.com/salesforce/lwc/commit/60f17bc73f7db164c0efe090f6d00dec0c6774c1))
* **engine:** loosening restrictions on focus elements ([#790](https://github.com/salesforce/lwc/issues/790)) ([d520c72](https://github.com/salesforce/lwc/commit/d520c7245f5174a927f36a1e939074a798c2322b))
* **engine:** marking dynamic nodes as dynamic ([#810](https://github.com/salesforce/lwc/issues/810)) ([958201c](https://github.com/salesforce/lwc/commit/958201cb33fcfef486c28ad039c761ac1cc19e07))
* **engine:** remove log when accessing childNodes ([#817](https://github.com/salesforce/lwc/issues/817)) ([9a29102](https://github.com/salesforce/lwc/commit/9a29102f2e56710bdb84d65e9213a419c7f4c4e0))
* **engine:** removing aggressive assert ([#818](https://github.com/salesforce/lwc/issues/818)) ([fdbc119](https://github.com/salesforce/lwc/commit/fdbc1195851772193b14bd07c437233f25977401))


### Features

* **compiler:** lwc dom mode directive ([#793](https://github.com/salesforce/lwc/issues/793)) ([e6b27c4](https://github.com/salesforce/lwc/commit/e6b27c4bcd1aa3d3ac3f0ad8259f1d4cb5c1a3fa))



## [0.31.4](https://github.com/salesforce/lwc/compare/v0.31.3...v0.31.4) (2018-11-07)


### Bug Fixes

* add microtasking to integration tests ([#808](https://github.com/salesforce/lwc/issues/808)) ([7c4b834](https://github.com/salesforce/lwc/commit/7c4b834c78425cde7a761c924f0edbf6325f43f7))



## [0.31.3](https://github.com/salesforce/lwc/compare/v0.31.2...v0.31.3) (2018-11-06)


### Bug Fixes

* **engine:** render() can only return qualifying templates ([#764](https://github.com/salesforce/lwc/issues/764)) ([c6556de](https://github.com/salesforce/lwc/commit/c6556de1582791cacec62812083470d27ad08ce9))
* **engine:** was leaking assert lib to prod ([#801](https://github.com/salesforce/lwc/issues/801)) ([d2942fc](https://github.com/salesforce/lwc/commit/d2942fc9166948c4fc66ea8b8520399d3df4febe))
* css newline ([#804](https://github.com/salesforce/lwc/issues/804)) ([c644c3b](https://github.com/salesforce/lwc/commit/c644c3b76c534042c1a41668b40e16afde9e77f1))
* integration flapper ([#807](https://github.com/salesforce/lwc/issues/807)) ([076385f](https://github.com/salesforce/lwc/commit/076385fb2d6c54628d682ce6cc8f043e5f31cf81))
* test expecting invalid warning ([#805](https://github.com/salesforce/lwc/issues/805)) ([c21f9ff](https://github.com/salesforce/lwc/commit/c21f9ff4c2f5369f59bcfa95f8b0dc24088e03ed))


### Features

* **engine:** getRootNode in patched nodes ([#786](https://github.com/salesforce/lwc/issues/786)) ([ede0d7b](https://github.com/salesforce/lwc/commit/ede0d7b8b1613ec2d9541a5d793795b6b5f4cbab))



## [0.31.2](https://github.com/salesforce/lwc/compare/v0.31.1...v0.31.2) (2018-11-03)


### Bug Fixes

* remove assert due to safari bug ([#798](https://github.com/salesforce/lwc/issues/798)) ([9381315](https://github.com/salesforce/lwc/commit/9381315f117edafbb6cf6c086161784692a41c3e))



## [0.31.1](https://github.com/salesforce/lwc/compare/v0.30.7...v0.31.1) (2018-11-02)


### Bug Fixes

* **engine:** using tabindex getter in assert ([#785](https://github.com/salesforce/lwc/issues/785)) ([e56b4e2](https://github.com/salesforce/lwc/commit/e56b4e23a75425b8a80dd5f1c5399dd312c0876b))
* remove harmful warning that encourages composed events ([#795](https://github.com/salesforce/lwc/issues/795)) ([e5cc47e](https://github.com/salesforce/lwc/commit/e5cc47e615365144a51ff8f9cae4205455c50304))


### Features

* CSS parsing and programatic imports ([#776](https://github.com/salesforce/lwc/issues/776)) ([f739710](https://github.com/salesforce/lwc/commit/f739710db42cf4f23197aa4bd3128ddc267f1298))
* **engine:** performance marks ([#756](https://github.com/salesforce/lwc/issues/756)) ([24e029a](https://github.com/salesforce/lwc/commit/24e029a692553ac3b21825a898c4aef6b4914da1))
* upgrade COMPAT to support splice ([#797](https://github.com/salesforce/lwc/issues/797)) ([1ab7f4a](https://github.com/salesforce/lwc/commit/1ab7f4a33304fa2c785434e03f1f506f7cea650a))



## [0.30.7](https://github.com/salesforce/lwc/compare/v0.30.6...v0.30.7) (2018-10-29)



## [0.30.6](https://github.com/salesforce/lwc/compare/v0.30.5...v0.30.6) (2018-10-29)



## [0.30.5](https://github.com/salesforce/lwc/compare/v0.30.4...v0.30.5) (2018-10-29)


### Bug Fixes

* **compiler:** resolve error code conflicts ([#770](https://github.com/salesforce/lwc/issues/770)) ([8885eb6](https://github.com/salesforce/lwc/commit/8885eb614eb605fb6649d52c62ee139a5ef70542))



## [0.30.4](https://github.com/salesforce/lwc/compare/v0.30.3...v0.30.4) (2018-10-26)


### Bug Fixes

* **engine:** fixing tab index assert ([#773](https://github.com/salesforce/lwc/issues/773)) ([667b929](https://github.com/salesforce/lwc/commit/667b9296cab2689a32cda4da1fbe68b1e4d2dd68))



## [0.30.3](https://github.com/salesforce/lwc/compare/v0.30.2...v0.30.3) (2018-10-26)


### Bug Fixes

* **engine:** fix issue [#766](https://github.com/salesforce/lwc/issues/766) to patch query selectors ([#769](https://github.com/salesforce/lwc/issues/769)) ([81093fc](https://github.com/salesforce/lwc/commit/81093fc39fdbc28253ae6336579a4d44f2942ce9))
* **engine:** focus delegation fixes to narrow false positives ([#763](https://github.com/salesforce/lwc/issues/763)) ([22e75a5](https://github.com/salesforce/lwc/commit/22e75a59c5a95500b4e7830ba1cfa81dec363859))
* **wire-service:** workaround babel minify issue in compat mode ([#768](https://github.com/salesforce/lwc/issues/768)) ([8e718ae](https://github.com/salesforce/lwc/commit/8e718aef2b46182545cfb57e815eb6c396c75477))


### Features

* **jest-transformer:** add transform for @salesforce/i18n ([#758](https://github.com/salesforce/lwc/issues/758)) ([00a13cc](https://github.com/salesforce/lwc/commit/00a13cc802c5d88bd60a2c1201d1d52787d32bab))
* **wire:** use class property default values ([#767](https://github.com/salesforce/lwc/issues/767)) ([4c76b9a](https://github.com/salesforce/lwc/commit/4c76b9a68d6cecc530ea4223c1b3184417f8bff1))



## [0.30.2](https://github.com/salesforce/lwc/compare/v0.30.1...v0.30.2) (2018-10-24)


### Bug Fixes

* **compiler:** resolves conflicts between locator and errors work ([#759](https://github.com/salesforce/lwc/issues/759)) ([a212efd](https://github.com/salesforce/lwc/commit/a212efd6bb521d98fbadf9e3694f6069ee2f1635))
* **engine:** error when event listener was on document ([#762](https://github.com/salesforce/lwc/issues/762)) ([6471a65](https://github.com/salesforce/lwc/commit/6471a65e9f90e395f5e066f8cd676f76778d7ea7))


### Features

* **compiler:** Implement error codes system onto compiler modules ([#726](https://github.com/salesforce/lwc/issues/726)) ([3ee81d5](https://github.com/salesforce/lwc/commit/3ee81d5c98fae0ffe50766ea3ea0fe5ea3db9a40))
* Add support for locators ([#701](https://github.com/salesforce/lwc/issues/701)) ([464daf4](https://github.com/salesforce/lwc/commit/464daf4c5d91009adba7c550900aa1cb98dcf089))
* **compiler:** throw on any non-whitelisted lwc imports ([#752](https://github.com/salesforce/lwc/issues/752)) ([9652133](https://github.com/salesforce/lwc/commit/965213350070fb049f66eeeca083e5c31d24e3b2))



## [0.30.1](https://github.com/salesforce/lwc/compare/v0.30.0...v0.30.1) (2018-10-22)



# [0.30.0](https://github.com/salesforce/lwc/compare/v0.29.26-1...v0.30.0) (2018-10-21)


### Features

* **wire:** wire output as wire parameter ([#742](https://github.com/salesforce/lwc/issues/742)) ([33de30e](https://github.com/salesforce/lwc/commit/33de30e539e069e42d750a06678a86fd9b6a8eb9))
* next rebased ([#734](https://github.com/salesforce/lwc/issues/734)) ([fb72740](https://github.com/salesforce/lwc/commit/fb727400ffb4c1a8938169ff06786ff525279981)), closes [#695](https://github.com/salesforce/lwc/issues/695) [#606](https://github.com/salesforce/lwc/issues/606) [#688](https://github.com/salesforce/lwc/issues/688) [#705](https://github.com/salesforce/lwc/issues/705)



## [0.29.26-1](https://github.com/salesforce/lwc/compare/v0.29.26...v0.29.26-1) (2018-10-16)


### Features

* **compiler:** collect module exports metadata ([#735](https://github.com/salesforce/lwc/issues/735)) ([3509be5](https://github.com/salesforce/lwc/commit/3509be521f084c6cc0a2464d7067d8e945cbc18d))



## [0.29.26](https://github.com/salesforce/lwc/compare/v0.29.25...v0.29.26) (2018-10-16)


### Bug Fixes

* retargeting works as expected for innerHTML template modifications ([#739](https://github.com/salesforce/lwc/issues/739)) ([efa6a66](https://github.com/salesforce/lwc/commit/efa6a662a86622b14299310490b0940712bf54ca))



## [0.29.25](https://github.com/salesforce/lwc/compare/v0.29.24...v0.29.25) (2018-10-15)



## [0.29.24](https://github.com/salesforce/lwc/compare/v0.29.23...v0.29.24) (2018-10-15)



## [0.29.23](https://github.com/salesforce/lwc/compare/v0.29.22...v0.29.23) (2018-10-15)



## [0.29.22](https://github.com/salesforce/lwc/compare/v0.29.21...v0.29.22) (2018-10-15)


### Features

* scoped ids ([#714](https://github.com/salesforce/lwc/issues/714)) ([4f48fc7](https://github.com/salesforce/lwc/commit/4f48fc76a62551b2b332a989c2fa2e0064712a0a))



## [0.29.21](https://github.com/salesforce/lwc/compare/v0.29.20...v0.29.21) (2018-10-13)



## [0.29.20](https://github.com/salesforce/lwc/compare/v0.29.19...v0.29.20) (2018-10-12)


### Bug Fixes

* **compiler:** static tabindex attr can only be 0 or -1 in templates ([#660](https://github.com/salesforce/lwc/issues/660)) ([7a2f3f4](https://github.com/salesforce/lwc/commit/7a2f3f4f24569ab5366922f841def9fcd58ef65e))



## [0.29.19](https://github.com/salesforce/lwc/compare/v0.29.18...v0.29.19) (2018-10-11)


### Bug Fixes

* **docs:** updating restrictions ([#725](https://github.com/salesforce/lwc/issues/725)) ([81e8c2b](https://github.com/salesforce/lwc/commit/81e8c2b1f5d4c73c0c1b68a28d2e9c03931de50b))
* better svg whitelisting (from domPurify) ([#728](https://github.com/salesforce/lwc/issues/728)) ([92a1b5e](https://github.com/salesforce/lwc/commit/92a1b5e26646a259e377e0334c9cef83582472c1))


### Features

* remove backwards compatibility support for "engine" ([#721](https://github.com/salesforce/lwc/issues/721)) ([e312f54](https://github.com/salesforce/lwc/commit/e312f54f3eeb7eace404757638ab94446e15a6df))
* **engine:** inline styles to support native shadow ([#540](https://github.com/salesforce/lwc/issues/540)) ([cecd751](https://github.com/salesforce/lwc/commit/cecd751f1293a3bd316fde4eab903a7dddfb1cc8)), closes [#691](https://github.com/salesforce/lwc/issues/691)



## [0.29.18](https://github.com/salesforce/lwc/compare/v0.29.17...v0.29.18) (2018-10-10)



## [0.29.17](https://github.com/salesforce/lwc/compare/v0.29.16...v0.29.17) (2018-10-10)


### Bug Fixes

* **engine:** fixes issue [#710](https://github.com/salesforce/lwc/issues/710) - add better error for invalid template ([#718](https://github.com/salesforce/lwc/issues/718)) ([7c6009f](https://github.com/salesforce/lwc/commit/7c6009f1d38d6729a42f2b8e752934fc014b1a67)), closes [#693](https://github.com/salesforce/lwc/issues/693)
* **engine:** support multi-level slotting when retargeting and querying ([#712](https://github.com/salesforce/lwc/issues/712)) ([7a22a8b](https://github.com/salesforce/lwc/commit/7a22a8bb7dddfd898971b18a28dd7b9b5d66cf8f))


### Features

* **engine:** add API for finding the constructor of a custom element ([#704](https://github.com/salesforce/lwc/issues/704)) ([f08d689](https://github.com/salesforce/lwc/commit/f08d6892a87cc6250d1330f24dca458f1db36586))



## [0.29.16](https://github.com/salesforce/lwc/compare/v0.29.14...v0.29.16) (2018-10-07)


### Bug Fixes

* **engine:** integration flapper - async-event-target ([#715](https://github.com/salesforce/lwc/issues/715)) ([6a7de86](https://github.com/salesforce/lwc/commit/6a7de861e54c28f2915a8c0b4a915dc2b0f084c5))


### Reverts

* Revert "feat(parse5): update parse5, usage, tests (#707)" (#716) ([d820941](https://github.com/salesforce/lwc/commit/d8209410d056a2e467d2df25155262c13275708c)), closes [#707](https://github.com/salesforce/lwc/issues/707) [#716](https://github.com/salesforce/lwc/issues/716)



## [0.29.14](https://github.com/salesforce/lwc/compare/v0.29.13...v0.29.14) (2018-10-05)


### Bug Fixes

* **engine:** fix traversal for error boundaries in native shadow DOM ([#686](https://github.com/salesforce/lwc/issues/686)) ([b4b29a1](https://github.com/salesforce/lwc/commit/b4b29a170a35e5cb4cbabd6fae8a0c06f49b4c9a))


### Features

* **compiler:** add sourcemap to options and result ([#696](https://github.com/salesforce/lwc/issues/696)) ([2a3ce0f](https://github.com/salesforce/lwc/commit/2a3ce0f876c269b4489222bcad763f177524cc4a))
* introduce secure API for template verification ([#693](https://github.com/salesforce/lwc/issues/693)) ([3b4a63e](https://github.com/salesforce/lwc/commit/3b4a63eb122b2813fcb5ec39133ad102cdb02b8f))
* **jest-transformer:** generate jest tests sourcemaps ([#706](https://github.com/salesforce/lwc/issues/706)) ([2b3b28d](https://github.com/salesforce/lwc/commit/2b3b28d9b7b782da6c88c56175fdbe34a72c2aad))
* **parse5:** update parse5, usage, tests ([#707](https://github.com/salesforce/lwc/issues/707)) ([64206dc](https://github.com/salesforce/lwc/commit/64206dcdafe0abc0bfe678e25a45104e042bf30b))



## [0.29.13](https://github.com/salesforce/lwc/compare/v0.29.12...v0.29.13) (2018-10-03)


### Features

* expose *internal* APIs ([#703](https://github.com/salesforce/lwc/issues/703)) ([b787190](https://github.com/salesforce/lwc/commit/b7871907c0020aa1067dd1417159ac2eff5403dc))


### Performance Improvements

* point to our own instance of best ([#700](https://github.com/salesforce/lwc/issues/700)) ([91bc49b](https://github.com/salesforce/lwc/commit/91bc49b7323b218f316f75339d7779cf5fa48a4a))



## [0.29.12](https://github.com/salesforce/lwc/compare/v0.29.11-1...v0.29.12) (2018-10-03)



## [0.29.11-1](https://github.com/salesforce/lwc/compare/v0.29.11...v0.29.11-1) (2018-10-02)


### Bug Fixes

* Remove `NODE_ENV` default value ([#687](https://github.com/salesforce/lwc/issues/687)) ([6d81d7a](https://github.com/salesforce/lwc/commit/6d81d7a0a057add52f9eb863e366b66250d93388))


### Features

* bundle metadata to include modules used and their props @W-5395396 ([#672](https://github.com/salesforce/lwc/issues/672)) ([039a2af](https://github.com/salesforce/lwc/commit/039a2af28c624c8ba869f53d7e832b9450663bce))


### Performance Improvements

* disable Best on IE11 ([#698](https://github.com/salesforce/lwc/issues/698)) ([bba0480](https://github.com/salesforce/lwc/commit/bba0480157ca920cc5b96b44dc2bd972b3600268))



## [0.29.11](https://github.com/salesforce/lwc/compare/v0.29.10...v0.29.11) (2018-10-02)


### Features

* **engine:** adding basic support for slotchange event ([#635](https://github.com/salesforce/lwc/issues/635)) ([ee0d7f3](https://github.com/salesforce/lwc/commit/ee0d7f3e4e30c3696f0ad0d02e23bdc26c60f21e))



## [0.29.10](https://github.com/salesforce/lwc/compare/v0.29.9...v0.29.10) (2018-10-02)


### Features

* **compiler:** detect unimported decorators ([#681](https://github.com/salesforce/lwc/issues/681)) ([4788b26](https://github.com/salesforce/lwc/commit/4788b26c7bfe95df364ef9c52001b588da13f80b))
* **svg:** validate allowed svg tags ([#694](https://github.com/salesforce/lwc/issues/694)) ([ae82aa7](https://github.com/salesforce/lwc/commit/ae82aa7bee716319bfd304a130c9fb12a7cde3d3))



## [0.29.9](https://github.com/salesforce/lwc/compare/v0.29.8...v0.29.9) (2018-09-29)


### Bug Fixes

* **engine:** identify LWC console logs ([#674](https://github.com/salesforce/lwc/issues/674)) ([816b643](https://github.com/salesforce/lwc/commit/816b643bd8a96e58ab66134f4a62d13cf0af1841))
* **jest-transformer:** update tests to reflect namespace syntax ([#685](https://github.com/salesforce/lwc/issues/685)) ([648922f](https://github.com/salesforce/lwc/commit/648922ff090ebda440197d55e8e9cb8bc4e792cd))
* zindex optimization in prod ([#690](https://github.com/salesforce/lwc/issues/690)) ([88f3dcd](https://github.com/salesforce/lwc/commit/88f3dcde83af59c117f9e6e33f3ee42450027b5a)), closes [#689](https://github.com/salesforce/lwc/issues/689)


### Features

* **jest-transformer:** add transform for @salesforce/contentAssetUrl ([#684](https://github.com/salesforce/lwc/issues/684)) ([b711b32](https://github.com/salesforce/lwc/commit/b711b323742237b4c5b4de61ec09b421929eedfa))



## [0.29.8](https://github.com/salesforce/lwc/compare/v0.29.7...v0.29.8) (2018-09-27)


### Bug Fixes

* upgrade compat ([#683](https://github.com/salesforce/lwc/issues/683)) ([eaab65c](https://github.com/salesforce/lwc/commit/eaab65c03339d90dc2be9c4e19bea72e2fe44837))



## [0.29.7](https://github.com/salesforce/lwc/compare/v0.29.7-pre01...v0.29.7) (2018-09-27)


### Bug Fixes

* **engine:** bail retargeting if target is detached ([#679](https://github.com/salesforce/lwc/issues/679)) ([faf9cd4](https://github.com/salesforce/lwc/commit/faf9cd43f8ac3dd1a027b088b21ef574cf0d6524))



## [0.29.7-pre01](https://github.com/salesforce/lwc/compare/v0.29.1...v0.29.7-pre01) (2018-09-26)


### Bug Fixes

* **engine:** fixes [#663](https://github.com/salesforce/lwc/issues/663) - unique keys for sloted elements ([#664](https://github.com/salesforce/lwc/issues/664)) ([00529a9](https://github.com/salesforce/lwc/commit/00529a9f8e59df4a10e0d9a71ba9b7b76885f446))
* **engine:** fixes issue [#658](https://github.com/salesforce/lwc/issues/658) - parentNode on slotted elements ([#661](https://github.com/salesforce/lwc/issues/661)) ([d22bdd8](https://github.com/salesforce/lwc/commit/d22bdd8778397434a4a06e2aa2bf36872bbf28eb))
* remove ignoring files ([#673](https://github.com/salesforce/lwc/issues/673)) ([c5d3e80](https://github.com/salesforce/lwc/commit/c5d3e800924aa8357571d1762d40373458b6dc79))
* remove release artifacts ([#649](https://github.com/salesforce/lwc/issues/649)) ([a528117](https://github.com/salesforce/lwc/commit/a5281172722ffc283a2a8a2449fe09574d07f5f7))
* revert namespace mapping support ([#662](https://github.com/salesforce/lwc/issues/662)) ([728b557](https://github.com/salesforce/lwc/commit/728b5579e29b6dae8dd18d7905131340b8169934))
* simplify rollup package ([#659](https://github.com/salesforce/lwc/issues/659)) ([e59f0f6](https://github.com/salesforce/lwc/commit/e59f0f66d88f56645ace5d54c5e87570851948ce))
* upgrade lwc rollup to support compat ([#646](https://github.com/salesforce/lwc/issues/646)) ([d1d3fa5](https://github.com/salesforce/lwc/commit/d1d3fa5cba2c03f1fa038b57652e11b49d032ab6))
* upgrading babel ([#653](https://github.com/salesforce/lwc/issues/653)) ([ee1e513](https://github.com/salesforce/lwc/commit/ee1e5139cff7c14ef32c566f37de306f02735468))


### Features

* augments metadata gathering for [@wire](https://github.com/wire) decorator ([#631](https://github.com/salesforce/lwc/issues/631)) ([4920a4e](https://github.com/salesforce/lwc/commit/4920a4ee5132982cfbf92913c35c495473f89578))
* **compiler:** warnings to change dynamic ids to static ids ([#620](https://github.com/salesforce/lwc/issues/620)) ([a32289a](https://github.com/salesforce/lwc/commit/a32289affae52053070ac0e623e22b0904a63747))
* better error message when event listener is missing ([#656](https://github.com/salesforce/lwc/issues/656)) ([e77f7a7](https://github.com/salesforce/lwc/commit/e77f7a75224a3a6ac7f6353a61a886aadd85933d))
* **postcss-plugin-lwc:** make CSS transform compatible with shadow DOM ([#637](https://github.com/salesforce/lwc/issues/637)) ([69ece4b](https://github.com/salesforce/lwc/commit/69ece4bc7589afa9f8b9ed7340a3fa23ab4ba9d6))


### Performance Improvements

* added ie11 agent and benchmark config ([#654](https://github.com/salesforce/lwc/issues/654)) ([2b1dac4](https://github.com/salesforce/lwc/commit/2b1dac402b574ca5e2807de0d98bf0939f65d539))
* upgrade agent: chrome 70 ([#648](https://github.com/salesforce/lwc/issues/648)) ([39e71c8](https://github.com/salesforce/lwc/commit/39e71c89c6b3d69ba3578cd8138ec895a4abeb77))
* upgrade best ([#647](https://github.com/salesforce/lwc/issues/647)) ([4f6f1c1](https://github.com/salesforce/lwc/commit/4f6f1c12b15b0935c0bfbde5a5982a61706ba3ee))
* upgrade best ([#677](https://github.com/salesforce/lwc/issues/677)) ([633a000](https://github.com/salesforce/lwc/commit/633a0008a81b6d44ede0f375d5141ffa545f974b))



## [0.29.1](https://github.com/salesforce/lwc/compare/v0.29.0...v0.29.1) (2018-09-13)



# [0.29.0](https://github.com/salesforce/lwc/compare/v0.28.2...v0.29.0) (2018-09-13)


### Bug Fixes

* rename @salesforce/resource-url to @salesforce/resourceUrl ([#638](https://github.com/salesforce/lwc/issues/638)) ([2a86c4d](https://github.com/salesforce/lwc/commit/2a86c4d141227d0ea2dc6c8e3ea4876cbda342a7))


### Features

* open usage of data-* and aria-* attributes in CSS ([#632](https://github.com/salesforce/lwc/issues/632)) ([9e269bf](https://github.com/salesforce/lwc/commit/9e269bfbc9a26eff1ce80d7d8473091076d54d68)), closes [#623](https://github.com/salesforce/lwc/issues/623)
* remove usage of :host-context ([#629](https://github.com/salesforce/lwc/issues/629)) ([5634840](https://github.com/salesforce/lwc/commit/5634840a7ca287acbb67b7f3872e3cff6fd5c6a5))



## [0.28.2](https://github.com/salesforce/lwc/compare/v0.28.0-rc1...v0.28.2) (2018-09-09)


### Bug Fixes

* renaming for namespaces ([#627](https://github.com/salesforce/lwc/issues/627)) ([6e9b75c](https://github.com/salesforce/lwc/commit/6e9b75c9ed107a5e09236f6f3f7465b2f717b759))


### Reverts

* Revert "v0.28.0-rc1" ([03170e6](https://github.com/salesforce/lwc/commit/03170e6579427b1b3ab2dafa1aa6f1fec484ac35))



# [0.28.0-rc1](https://github.com/salesforce/lwc/compare/v0.27.1...v0.28.0-rc1) (2018-09-08)



## [0.27.1](https://github.com/salesforce/lwc/compare/v0.27.0...v0.27.1) (2018-09-05)


### Bug Fixes

* **engine:** asserts logs require elm to print component stack ([#573](https://github.com/salesforce/lwc/issues/573)) ([387fd05](https://github.com/salesforce/lwc/commit/387fd058f0a2367b9f3cbcd6a9a45dbb5e43e3f2)), closes [#563](https://github.com/salesforce/lwc/issues/563)


### Features

* **babel-plugin-transform-lwc-class:** add component tag name support ([#621](https://github.com/salesforce/lwc/issues/621)) ([57cae0c](https://github.com/salesforce/lwc/commit/57cae0c8f84c658f032d0e7210e0c4ab71785ef6))
* **compiler:** add namespace support for js/html transform ([#611](https://github.com/salesforce/lwc/issues/611)) ([d5ced31](https://github.com/salesforce/lwc/commit/d5ced31b6f7daaa5c1463ff4e5958488138159f9))
* **engine:** adding this.template.activeElement into faux-shadow ([#612](https://github.com/salesforce/lwc/issues/612)) ([90d18ef](https://github.com/salesforce/lwc/commit/90d18ef7bf4739e327101e3c2b8653e5839ba596))


### Performance Improvements

* **engine:** trying to get best back on track ([#616](https://github.com/salesforce/lwc/issues/616)) ([6e78171](https://github.com/salesforce/lwc/commit/6e78171be0c1649df22c51e6602f72528a577e57))



# [0.27.0](https://github.com/salesforce/lwc/compare/v0.26.0...v0.27.0) (2018-08-25)


### Bug Fixes

* **engine:** undefined initial values should be respected ([#558](https://github.com/salesforce/lwc/issues/558)) ([e2f24b8](https://github.com/salesforce/lwc/commit/e2f24b80524d075810cfd8f32669c97bcac3dde7)), closes [#490](https://github.com/salesforce/lwc/issues/490)



# [0.26.0](https://github.com/salesforce/lwc/compare/v0.25.5...v0.26.0) (2018-08-24)


### Bug Fixes

* disable dual [@api](https://github.com/api) decorators support  @W-5165180 ([#598](https://github.com/salesforce/lwc/issues/598)) ([ce9308b](https://github.com/salesforce/lwc/commit/ce9308b58512b96db321dbbc0243ecea38a5a38c))
* **engine:** closes [#515](https://github.com/salesforce/lwc/issues/515) by removing lazy init ([#517](https://github.com/salesforce/lwc/issues/517)) ([38fe207](https://github.com/salesforce/lwc/commit/38fe207e7b745e3977766df3e01bcc1a24e1b4ae))
* remove comments in minified bundle @W-5320429 ([#599](https://github.com/salesforce/lwc/issues/599)) ([46d65c0](https://github.com/salesforce/lwc/commit/46d65c0989a8717828c9c87e8f6db13700b5181e))
* update package version when releasing ([#595](https://github.com/salesforce/lwc/issues/595)) ([ea0434d](https://github.com/salesforce/lwc/commit/ea0434d738697b9af6425eb20ad50c2204d0484f))
* update wire pkg and playground ([#604](https://github.com/salesforce/lwc/issues/604)) ([ccc92ed](https://github.com/salesforce/lwc/commit/ccc92edda850a9509fb1ef5ce58f27624ad5d0d5))
* validate directive-less template tag ([#589](https://github.com/salesforce/lwc/issues/589)) ([7739e64](https://github.com/salesforce/lwc/commit/7739e6402a04f690b1af12cedf5a7fa66c4405ff))
* **engine:** invert condition to apply click-event-composed polyfill ([#590](https://github.com/salesforce/lwc/issues/590)) ([#591](https://github.com/salesforce/lwc/issues/591)) ([cb7c43a](https://github.com/salesforce/lwc/commit/cb7c43ac39f04fe5885badf73bfcd96699ae0f89))



## [0.25.5](https://github.com/salesforce/lwc/compare/v0.25.5-alpha...v0.25.5) (2018-08-15)


### Bug Fixes

* **build:** update version before building dist files to publish ([#585](https://github.com/salesforce/lwc/issues/585)) ([bd5da03](https://github.com/salesforce/lwc/commit/bd5da03ca6cb3d298610a1e95297bd879a813fa6))
* disable verify when using auth token ([#587](https://github.com/salesforce/lwc/issues/587)) ([2a3ec2a](https://github.com/salesforce/lwc/commit/2a3ec2a0035af89e378b1afad6196f6acdda3319))
* remove npm client configuration ([10ef9be](https://github.com/salesforce/lwc/commit/10ef9be689bf533f4431064607281cc879786612))



## [0.25.5-alpha](https://github.com/salesforce/lwc/compare/v0.25.4...v0.25.5-alpha) (2018-08-14)


### Bug Fixes

* **engine:** support stopPropagation on the tpl ([#571](https://github.com/salesforce/lwc/issues/571)) ([7e729c8](https://github.com/salesforce/lwc/commit/7e729c81d9a041b648fd2b923d537459d2661598)), closes [#566](https://github.com/salesforce/lwc/issues/566)


### Features

* **engine:** polyfill for non-composed click events ([#568](https://github.com/salesforce/lwc/issues/568)) ([d15b77b](https://github.com/salesforce/lwc/commit/d15b77bc3b2c7efd4924d57a1f3d044ed5051b2b))



## [0.25.4](https://github.com/salesforce/lwc/compare/v0.25.3...v0.25.4) (2018-08-12)


### Bug Fixes

* make [@api](https://github.com/api) decorator spec compliant ([#572](https://github.com/salesforce/lwc/issues/572)) ([deeb6bb](https://github.com/salesforce/lwc/commit/deeb6bb6c0cb32c6e07d904830773aa5006562ed))



## [0.25.3](https://github.com/salesforce/lwc/compare/v0.25.3-alpha11...v0.25.3) (2018-08-11)



## [0.25.3-alpha11](https://github.com/salesforce/lwc/compare/v0.25.3-alpha10...v0.25.3-alpha11) (2018-08-11)



## [0.25.3-alpha07](https://github.com/salesforce/lwc/compare/v0.25.3-alpha06...v0.25.3-alpha07) (2018-08-10)



## [0.25.2](https://github.com/salesforce/lwc/compare/v0.25.2-alpha01...v0.25.2) (2018-08-10)



## [0.25.2-alpha01](https://github.com/salesforce/lwc/compare/v0.24.20...v0.25.2-alpha01) (2018-08-09)


### Bug Fixes

* allow test resolver to resolve lwc ([#565](https://github.com/salesforce/lwc/issues/565)) ([1f6653d](https://github.com/salesforce/lwc/commit/1f6653d510330a555312596a8794c0369deb1940))
* renaming engine and named imports ([#567](https://github.com/salesforce/lwc/issues/567)) ([c0da00d](https://github.com/salesforce/lwc/commit/c0da00db56c40361c6d42d9b45f4593da05221af))



## [0.24.20](https://github.com/salesforce/lwc/compare/v0.24.19-alpha03...v0.24.20) (2018-08-07)



## [0.24.19-alpha03](https://github.com/salesforce/lwc/compare/v0.24.19-alpha02...v0.24.19-alpha03) (2018-08-06)



## [0.24.17](https://github.com/salesforce/lwc/compare/v0.24.17-alpha02...v0.24.17) (2018-08-06)



## [0.24.17-alpha02](https://github.com/salesforce/lwc/compare/v0.24.17-alpha01...v0.24.17-alpha02) (2018-08-06)


### Bug Fixes

* upgrade compat dependencies (add setPrototypeOf) ([#559](https://github.com/salesforce/lwc/issues/559)) ([b982bd8](https://github.com/salesforce/lwc/commit/b982bd8c23e487438dd8bc1146abb7e8c8f6e5f3))


### Features

* allow both "lwc" and "engine" sources ([#560](https://github.com/salesforce/lwc/issues/560)) ([501586c](https://github.com/salesforce/lwc/commit/501586c49f534cb623f6a7c100719cc77454b3e3))



## [0.24.16](https://github.com/salesforce/lwc/compare/v0.25.1-alpha24...v0.24.16) (2018-08-02)



## [0.25.1-alpha24](https://github.com/salesforce/lwc/compare/v0.25.1-alpha22...v0.25.1-alpha24) (2018-08-02)



## [0.25.1-alpha19](https://github.com/salesforce/lwc/compare/v0.24.14...v0.25.1-alpha19) (2018-08-01)


### Bug Fixes

* **compiler:** correct module-resolver error messages [@bug](https://github.com/bug) W-5192589@ ([#551](https://github.com/salesforce/lwc/issues/551)) ([d1e93cc](https://github.com/salesforce/lwc/commit/d1e93cc00d675b940f7514fdbbb7fd4aaa2f34ee))



## [0.25.1-alpha18](https://github.com/salesforce/lwc/compare/v0.25.1-alpha17...v0.25.1-alpha18) (2018-08-01)


### Bug Fixes

* **engine:** never access props from proxies ([#546](https://github.com/salesforce/lwc/issues/546)) ([d0cf318](https://github.com/salesforce/lwc/commit/d0cf318477e148883b88a10dc30686f04a224df3))
* **lwc-compiler:** invalid CSS generation when minified is enabled ([#552](https://github.com/salesforce/lwc/issues/552)) ([f19ebb1](https://github.com/salesforce/lwc/commit/f19ebb148631d5155f30322688653380d5cb6558))



## [0.25.1-alpha17](https://github.com/salesforce/lwc/compare/v0.25.1-alpha16...v0.25.1-alpha17) (2018-07-31)



## [0.25.1-alpha16](https://github.com/salesforce/lwc/compare/v0.25.1-alpha15...v0.25.1-alpha16) (2018-07-31)


### Bug Fixes

* update babel-minify to fix minification issue ([#545](https://github.com/salesforce/lwc/issues/545)) ([3c68a69](https://github.com/salesforce/lwc/commit/3c68a69ac609e0856d920043dd06a40183870670))



## [0.25.1-alpha15](https://github.com/salesforce/lwc/compare/v0.25.1-alpha14...v0.25.1-alpha15) (2018-07-31)


### Reverts

* Revert "release: v0.25.1-alpha12" ([b3ba230](https://github.com/salesforce/lwc/commit/b3ba2302c92cfff257cc631d280227e50b78a2c1))



## [0.25.1-alpha14](https://github.com/salesforce/lwc/compare/v0.25.1-alpha13...v0.25.1-alpha14) (2018-07-31)



## [0.25.1-alpha11](https://github.com/salesforce/lwc/compare/v0.25.1-alpha10...v0.25.1-alpha11) (2018-07-30)


### Bug Fixes

* **engine:** wrapping assert for dev-only ([#544](https://github.com/salesforce/lwc/issues/544)) ([751904b](https://github.com/salesforce/lwc/commit/751904baee2ba1af2b9530aa6a256a055d9cbbe0))



## [0.25.1-alpha06](https://github.com/salesforce/lwc/compare/v0.25.1-alpha05...v0.25.1-alpha06) (2018-07-27)


### Bug Fixes

* **engine:** closes issue [#538](https://github.com/salesforce/lwc/issues/538) to support remove listener during invoke  ([#541](https://github.com/salesforce/lwc/issues/541)) ([19121d1](https://github.com/salesforce/lwc/commit/19121d181e14ea7f0997dabbf1705746e7bed3c7))



## [0.24.13-alpha01](https://github.com/salesforce/lwc/compare/v0.24.12-alpha06...v0.24.13-alpha01) (2018-07-26)


### Bug Fixes

* **ci:** run prepare before release ([#531](https://github.com/salesforce/lwc/issues/531)) ([c2379c7](https://github.com/salesforce/lwc/commit/c2379c752a0b8691888bffb0257580ce39e6b8b8))
* **engine:** closes [#524](https://github.com/salesforce/lwc/issues/524) relax attribute mutation assertion ([#525](https://github.com/salesforce/lwc/issues/525)) ([0fad9ab](https://github.com/salesforce/lwc/commit/0fad9abfcda462b669c59324499dbdc6bef837e9))
* **engine:** refactor condition to apply event-composed polyfill ([#534](https://github.com/salesforce/lwc/issues/534)) ([84fbfd0](https://github.com/salesforce/lwc/commit/84fbfd05ee0cd1edad75251f3edac7e44864914d))
* Escape backtick and backslash in CSS ([#536](https://github.com/salesforce/lwc/issues/536)) ([237d88b](https://github.com/salesforce/lwc/commit/237d88b513f5dbe7b580bff2c1b9f6bca52d89ce)), closes [#530](https://github.com/salesforce/lwc/issues/530)


### Features

* **lwc-template-compiler:** Add new compiler API compileToFunction ([#528](https://github.com/salesforce/lwc/issues/528)) ([9cd6952](https://github.com/salesforce/lwc/commit/9cd6952d86b221edcc86e83a91e813afcbea98f8))



## [0.24.2](https://github.com/salesforce/lwc/compare/v0.24.1...v0.24.2) (2018-07-18)



## [0.24.1](https://github.com/salesforce/lwc/compare/v0.23.2...v0.24.1) (2018-07-13)


### Bug Fixes

* **engine:** [214] no longer sharing shadow targets ([#443](https://github.com/salesforce/lwc/issues/443)) ([#446](https://github.com/salesforce/lwc/issues/446)) ([119df9c](https://github.com/salesforce/lwc/commit/119df9c429db8f3b7a87a049a9a2e6dc3225bec2))
* **engine:** bug introduced that breaks circular on proto chain ([#505](https://github.com/salesforce/lwc/issues/505)) ([b8287f1](https://github.com/salesforce/lwc/commit/b8287f1a607bd62045b5de29ff360887080b126c))
* **engine:** closes [#486](https://github.com/salesforce/lwc/issues/486) to lowercase tag names ([#494](https://github.com/salesforce/lwc/issues/494)) ([704422f](https://github.com/salesforce/lwc/commit/704422f6730d12c88ea0afaecd5524f954102ab7))
* **engine:** closes issue [#225](https://github.com/salesforce/lwc/issues/225) - value and checked props are live ([#471](https://github.com/salesforce/lwc/issues/471)) ([473a1b3](https://github.com/salesforce/lwc/commit/473a1b38d82a6a4ba12efa0122694c57b542135a))
* **engine:** composed event whitelist ([#462](https://github.com/salesforce/lwc/issues/462)) ([3b57eb7](https://github.com/salesforce/lwc/commit/3b57eb7ef0dcdb0f8f4317c17cf0d9cdcda646bc))
* **engine:** engine code should never go thru a proxy obj ([#424](https://github.com/salesforce/lwc/issues/424)) ([50fbc52](https://github.com/salesforce/lwc/commit/50fbc52714def5a8f7874caf24ac27f6ad542547))
* **engine:** forcing composed: true for focusout events ([#465](https://github.com/salesforce/lwc/issues/465)) ([3c0a6cb](https://github.com/salesforce/lwc/commit/3c0a6cb3804907b648d721ca66f6937e33299458))
* **engine:** handling AOM properties on anchor tags ([#488](https://github.com/salesforce/lwc/issues/488)) ([575f881](https://github.com/salesforce/lwc/commit/575f88127069cc4241bd7951a3fa7836d7604e6a))
* **engine:** handling event target in window listeners ([#499](https://github.com/salesforce/lwc/issues/499)) ([0ff8ff2](https://github.com/salesforce/lwc/commit/0ff8ff24b3b386cc8fe9ccd5ae8366309681383c))
* **engine:** incorrect key for the owner when retargeting ([#472](https://github.com/salesforce/lwc/issues/472)) ([539386a](https://github.com/salesforce/lwc/commit/539386a5fbb501a71cae37d0691a98fd6936b563))
* **engine:** issue [#180](https://github.com/salesforce/lwc/issues/180) - getAttribute for data-foo ([#468](https://github.com/salesforce/lwc/issues/468)) ([fcbbd0d](https://github.com/salesforce/lwc/commit/fcbbd0de9e92b44501ce0e544191b33c7d78c4b2))
* **engine:** opt-out of initial undef prop value in diff ([#490](https://github.com/salesforce/lwc/issues/490)) ([17133c6](https://github.com/salesforce/lwc/commit/17133c6dc2cbb4107b0ee2840b81b946ee3995d4))
* **engine:** removing "is" in benchmarks ([#451](https://github.com/salesforce/lwc/issues/451)) ([b86af35](https://github.com/salesforce/lwc/commit/b86af3593f0ceea26a5072327e8678a2b9aaeb14))
* **engine:** support locker to manually create elements ([#508](https://github.com/salesforce/lwc/issues/508)) ([87b86e5](https://github.com/salesforce/lwc/commit/87b86e570d3ff5f2c3d89501584e4692f93fbfdf))
* **engine:** validate slot names on every rendering ([#470](https://github.com/salesforce/lwc/issues/470)) ([df6e612](https://github.com/salesforce/lwc/commit/df6e6120049b95b6681fc128141cfc300f8ef19b))
* **lwc-template-compiler:** iteration in SVG element ([#460](https://github.com/salesforce/lwc/issues/460)) ([ff91f08](https://github.com/salesforce/lwc/commit/ff91f08d85e602aef7efbc34ff8b54a766ef719b))
* **test-utils:** convert to cjs module ([#431](https://github.com/salesforce/lwc/issues/431)) ([3e65275](https://github.com/salesforce/lwc/commit/3e65275a92646a3ffa47b04253e118bbd4e9dc06))
* **wire-service:** error with invalid adapter id ([#475](https://github.com/salesforce/lwc/issues/475)) ([bb0a064](https://github.com/salesforce/lwc/commit/bb0a064144173adf1c7999d0ec4f935b02789011))
* **wire-service:** support optional config object on [@wire](https://github.com/wire) ([#473](https://github.com/salesforce/lwc/issues/473)) ([34f0d85](https://github.com/salesforce/lwc/commit/34f0d859225a44794bca62f29dda55eb08917cb3)), closes [#181](https://github.com/salesforce/lwc/issues/181) [#149](https://github.com/salesforce/lwc/issues/149)
* add missing npm dependency. Allow dynamic imports ([#461](https://github.com/salesforce/lwc/issues/461)) ([651494c](https://github.com/salesforce/lwc/commit/651494c2db17d3acb6c8724cba4651a018397bb8))


### Features

* CSS variable injection ([#426](https://github.com/salesforce/lwc/issues/426)) ([c8d0f9c](https://github.com/salesforce/lwc/commit/c8d0f9c1f45ee61773bc4817adc0f1c68ea31257))
* **compiler:** checked transformation errors ([#496](https://github.com/salesforce/lwc/issues/496)) ([d2f6e63](https://github.com/salesforce/lwc/commit/d2f6e6321f8a573c356423a074cce4957952f5a7))
* **compiler:** do not enforce getter/setter pairs for api decorators ([#474](https://github.com/salesforce/lwc/issues/474)) ([b662c5d](https://github.com/salesforce/lwc/commit/b662c5deb8c22c65080c5479fa8fe2413e4035a6))
* **engine:** api to build custom elements ([#87](https://github.com/salesforce/lwc/issues/87)) ([614e8dd](https://github.com/salesforce/lwc/commit/614e8ddf70fcc40c0e2c5aabe7f7da4801f7f1cb))
* **engine:** Implements slot assigned nodes/elements ([#442](https://github.com/salesforce/lwc/issues/442)) ([8b26852](https://github.com/salesforce/lwc/commit/8b268527b066d2a45680cbdb3f3ae77354b026f2))
* **jest-transformer:** Add babel transform for new scoped imports  ([#463](https://github.com/salesforce/lwc/issues/463)) ([4893505](https://github.com/salesforce/lwc/commit/4893505350eed618f618592bc2c32080a9940109))


### Reverts

* Revert "refactor(engine): locker does not longer need to leak base constructor (#509)" (#510) ([a4af587](https://github.com/salesforce/lwc/commit/a4af5871ef22085de54ffe72ca88468a2026ed7b)), closes [#509](https://github.com/salesforce/lwc/issues/509) [#510](https://github.com/salesforce/lwc/issues/510)



## [0.23.2](https://github.com/salesforce/lwc/compare/v0.23.1...v0.23.2) (2018-06-14)


### Bug Fixes

* **engine:** adding integration tests for async events ([#411](https://github.com/salesforce/lwc/issues/411)) ([4e2e222](https://github.com/salesforce/lwc/commit/4e2e222ba0083ee851ce0b889e18c9e588af88e2))


### Features

* **test-utils:** add lwc-test-utils with templateQuerySelector API ([#414](https://github.com/salesforce/lwc/issues/414)) ([c07376c](https://github.com/salesforce/lwc/commit/c07376c02ea46547dc0dffaa1515934f2679f982))



## [0.23.1](https://github.com/salesforce/lwc/compare/v0.23.0...v0.23.1) (2018-06-13)


### Bug Fixes

* **engine:** never use a dot notation of patched objects ([#410](https://github.com/salesforce/lwc/issues/410)) ([2c6b1f4](https://github.com/salesforce/lwc/commit/2c6b1f40697cd315f59098ef714a740259518719))
* **jest-preset:** remove trailing comma from json ([#409](https://github.com/salesforce/lwc/issues/409)) ([369e073](https://github.com/salesforce/lwc/commit/369e073e46f9afa3fd10d8a82bb6e074c544c4d0))



# [0.23.0](https://github.com/salesforce/lwc/compare/v0.22.8...v0.23.0) (2018-06-13)


### Bug Fixes

* simplify style logic in template compiler ([#314](https://github.com/salesforce/lwc/issues/314)) ([598d940](https://github.com/salesforce/lwc/commit/598d94067d751eefb4049e3b1c7312d31376da26))
* Use token for the styling host element instead of tag name ([#390](https://github.com/salesforce/lwc/issues/390)) ([cccc63d](https://github.com/salesforce/lwc/commit/cccc63d31ae77ee9afdde6e70d4e1dfe01bfdd86)), closes [#383](https://github.com/salesforce/lwc/issues/383)
* **engine:** adding more tests for proxies ([#407](https://github.com/salesforce/lwc/issues/407)) ([7c2ae0a](https://github.com/salesforce/lwc/commit/7c2ae0a77ff564b72af443a9e1a8e0edb65ce9b5))
* **engine:** allowing global listeners ([#404](https://github.com/salesforce/lwc/issues/404)) ([da2d3c7](https://github.com/salesforce/lwc/commit/da2d3c70d3ad9c1d2eeab863ca74e4a1f95f40d3))


### Features

* Add customProperties config to postcss-lwc-plugin ([#349](https://github.com/salesforce/lwc/issues/349)) ([231e00d](https://github.com/salesforce/lwc/commit/231e00d4baa9ea1a7f98b135bcd8d4b519b9bcd5))



## [0.22.8](https://github.com/salesforce/lwc/compare/v0.22.7...v0.22.8) (2018-06-12)



## [0.22.7](https://github.com/salesforce/lwc/compare/v0.22.6...v0.22.7) (2018-06-10)



## [0.22.6](https://github.com/salesforce/lwc/compare/v0.22.5...v0.22.6) (2018-06-08)


### Bug Fixes

* **compiler:** displaying correct ambigious attribute name ([#377](https://github.com/salesforce/lwc/issues/377)) ([4c0720a](https://github.com/salesforce/lwc/commit/4c0720a583279d20431b01315001b80315e4693d))
* **engine:** Adding warning on native shadow childNodes ([#382](https://github.com/salesforce/lwc/issues/382)) ([156b03d](https://github.com/salesforce/lwc/commit/156b03de96db01a6b37fd6111fb3dd19773173f2))
* **engine:** handling dispatching events inside of root event handlers ([#391](https://github.com/salesforce/lwc/issues/391)) ([02b9402](https://github.com/salesforce/lwc/commit/02b9402ae11b5ec5a7d2714a6de9baaf26cde6b2))
* **engine:** including text nodes to childNodes ([#389](https://github.com/salesforce/lwc/issues/389)) ([9cbd853](https://github.com/salesforce/lwc/commit/9cbd853b88ca0e70d2dced8729b99de71a4ec817))
* **engine:** remove non-track state warning ([#376](https://github.com/salesforce/lwc/issues/376)) ([485357e](https://github.com/salesforce/lwc/commit/485357e06277d27339c5eafc748f4a40e45c8957))
* **engine:** shadow root childNodes ([#374](https://github.com/salesforce/lwc/issues/374)) ([a4c21a0](https://github.com/salesforce/lwc/commit/a4c21a054ecbe4a7b763ecb2e9d6fb5d6a3b779c))


### Features

* **compiler:** support default import identifier for wire decorator ([#378](https://github.com/salesforce/lwc/issues/378)) ([905dd78](https://github.com/salesforce/lwc/commit/905dd7854fa20128109f5550205d324f9bde103f))
* **engine:** slot assignedSlot property ([#381](https://github.com/salesforce/lwc/issues/381)) ([6a36afc](https://github.com/salesforce/lwc/commit/6a36afca61474f17532504103ea71c395224af2d))
* **lwc-compiler:** add baseDir support ([#375](https://github.com/salesforce/lwc/issues/375)) ([d1cf4a7](https://github.com/salesforce/lwc/commit/d1cf4a75b89eb5bcfc7fffc099344d547ddc0373))



## [0.22.5](https://github.com/salesforce/lwc/compare/v0.22.4...v0.22.5) (2018-06-03)


### Bug Fixes

* disable shadow and membrane in prod ([#372](https://github.com/salesforce/lwc/issues/372)) ([41149c2](https://github.com/salesforce/lwc/commit/41149c2209ee5d5ba8219cf326496a232618bf53))



## [0.22.4](https://github.com/salesforce/lwc/compare/v0.22.3...v0.22.4) (2018-06-03)


### Bug Fixes

* removing shadowRoot property from elements ([#371](https://github.com/salesforce/lwc/issues/371)) ([fb1e968](https://github.com/salesforce/lwc/commit/fb1e968c31181d8f4eac279955ea913d45104b65))



## [0.22.3](https://github.com/salesforce/lwc/compare/v0.22.2...v0.22.3) (2018-06-02)



## [0.22.2](https://github.com/salesforce/lwc/compare/v0.22.1...v0.22.2) (2018-06-02)


### Bug Fixes

* **engine:** expose shadowRoot if the mode is open ([#367](https://github.com/salesforce/lwc/issues/367)) ([3de5ec3](https://github.com/salesforce/lwc/commit/3de5ec39d4c0400b9c585e3de46f3b4c6e69b662))
* **engine:** fixing slotted event targets ([#368](https://github.com/salesforce/lwc/issues/368)) ([def3b83](https://github.com/salesforce/lwc/commit/def3b832be6d2d9ccf4659e19e510af6ff62117a))



## [0.22.1](https://github.com/salesforce/lwc/compare/v0.22.0...v0.22.1) (2018-05-31)


### Bug Fixes

* **engine:** fixed [#342](https://github.com/salesforce/lwc/issues/342) - clean up and docs ([#358](https://github.com/salesforce/lwc/issues/358)) ([01c7eb8](https://github.com/salesforce/lwc/commit/01c7eb8c09755ade04c7b17dcaba701c852ae54c))
* **engine:** fixing event target from slotted element ([#359](https://github.com/salesforce/lwc/issues/359)) ([594e508](https://github.com/salesforce/lwc/commit/594e5085d2dcb3cb999b1362e3370cf3f8756bd9))
* **engine:** going through cmpRoot to get default aria value ([#360](https://github.com/salesforce/lwc/issues/360)) ([6322456](https://github.com/salesforce/lwc/commit/6322456e94666ab96d1d296505955a9002d05919))



# [0.22.0](https://github.com/salesforce/lwc/compare/v0.21.0...v0.22.0) (2018-05-31)


### Bug Fixes

* **engine:** removing iframe content window unwrapping ([#356](https://github.com/salesforce/lwc/issues/356)) ([14f8e8b](https://github.com/salesforce/lwc/commit/14f8e8b6737091b193e21674077dc240c8f0347a))


### Features

* **compiler:** removed compiler slotset ([#348](https://github.com/salesforce/lwc/issues/348)) ([cab0f5b](https://github.com/salesforce/lwc/commit/cab0f5b0c55a6ad9d253a9903081f90a0906aa00))
* **git:** add commit validation types ([#351](https://github.com/salesforce/lwc/issues/351)) ([5c974c9](https://github.com/salesforce/lwc/commit/5c974c9476cab02c2c5d49401657f8c843ce72a6))



# [0.21.0](https://github.com/salesforce/lwc/compare/v0.20.5...v0.21.0) (2018-05-29)


### Bug Fixes

* **engine:** live bindings for value and checked properties 3nd attempt ([#340](https://github.com/salesforce/lwc/issues/340)) ([ef4acff](https://github.com/salesforce/lwc/commit/ef4acff67dbe66fa1e7ad2afe9593a4004085d6d))
* **engine:** preserve order of event dispaching between CE and SR ([#309](https://github.com/salesforce/lwc/issues/309)) ([1a1ba17](https://github.com/salesforce/lwc/commit/1a1ba17a17b506a932bf799b1f524f6fb8b2e124))
* **engine:** remove piercing membrane ([#324](https://github.com/salesforce/lwc/issues/324)) ([1e4c7f1](https://github.com/salesforce/lwc/commit/1e4c7f1c7283b3e7762ec8e557af8b1d7c565210))
* **tests:** fixed event integration test ([#346](https://github.com/salesforce/lwc/issues/346)) ([7402138](https://github.com/salesforce/lwc/commit/74021380768aa0fa9fdc22accf26a17014c48310))


### Features

* **compiler:** raptor on platform ([#298](https://github.com/salesforce/lwc/issues/298)) ([922de78](https://github.com/salesforce/lwc/commit/922de7819fd588a654320913832a0ee13f355640))



## [0.20.5](https://github.com/salesforce/lwc/compare/v0.20.4...v0.20.5) (2018-05-23)


### Bug Fixes

* event retargeting issue with nested component ([#338](https://github.com/salesforce/lwc/issues/338)) ([a21121b](https://github.com/salesforce/lwc/commit/a21121b14bc45cdf2c5732bbd028c1a01caff71d))
* getRootNode when composed is false and the element is the root ([#337](https://github.com/salesforce/lwc/issues/337)) ([8dd8392](https://github.com/salesforce/lwc/commit/8dd83920c45da55ab41e515ad771d0d8bced1656))



## [0.20.4](https://github.com/salesforce/lwc/compare/v0.20.3...v0.20.4) (2018-05-21)


### Bug Fixes

* **engine:** Fixing composed on getRootNode call in pierce ([#313](https://github.com/salesforce/lwc/issues/313)) ([6ad3b7c](https://github.com/salesforce/lwc/commit/6ad3b7c4119a9c9e99694d6afe80f173bdec7a04))
* Ensure uniqueness of public properties are compile time ([#323](https://github.com/salesforce/lwc/issues/323)) ([bf88354](https://github.com/salesforce/lwc/commit/bf8835468300d34830c507cc6fe7abaea775c55d))
* Forbid usage of :root pseudo-class selector ([#303](https://github.com/salesforce/lwc/issues/303)) ([7413286](https://github.com/salesforce/lwc/commit/7413286b46459501434aa18cec8306d354b99751))
* Linting issue introduced by merge on master ([#315](https://github.com/salesforce/lwc/issues/315)) ([6ad80ca](https://github.com/salesforce/lwc/commit/6ad80ca430c9652ca9f5201883a83b59c5cf8cc4))
* Transform standalone pseudo class selectors ([#310](https://github.com/salesforce/lwc/issues/310)) ([9adea2d](https://github.com/salesforce/lwc/commit/9adea2d4166463bd0ecbdee4bc449b2c03f52f69))


### Features

* Add support for style injection in compiler ([#302](https://github.com/salesforce/lwc/issues/302)) ([3b754f8](https://github.com/salesforce/lwc/commit/3b754f89175e14994273e882ab94d9c9518c4f62))
* Restrict usage of attributes in stylesheets ([#316](https://github.com/salesforce/lwc/issues/316)) ([948fbb9](https://github.com/salesforce/lwc/commit/948fbb95bc828111c627e28cba41397c63e5b951)), closes [#261](https://github.com/salesforce/lwc/issues/261)



## [0.20.3](https://github.com/salesforce/lwc/compare/v0.20.2...v0.20.3) (2018-05-15)


### Bug Fixes

* **husky:** fix husky release ([#297](https://github.com/salesforce/lwc/issues/297)) ([75722cb](https://github.com/salesforce/lwc/commit/75722cb231c9a0f99c845dfbcdc9115a9f74fbd3))
* upgrade compat packages ([#301](https://github.com/salesforce/lwc/issues/301)) ([cf5f5ae](https://github.com/salesforce/lwc/commit/cf5f5ae308e57cc6097f13d21ab000e9ca740f2a))



## [0.20.2](https://github.com/salesforce/lwc/compare/v0.20.0...v0.20.2) (2018-05-11)


### Bug Fixes

* **engine:** add existence check in removeChild ([#285](https://github.com/salesforce/lwc/issues/285)) ([81642fd](https://github.com/salesforce/lwc/commit/81642fd6e1c1181441e13ee20c3bd6f3f6bd647d))
* **engine:** define setter along with getter in global html attr ([#277](https://github.com/salesforce/lwc/issues/277)) ([5324101](https://github.com/salesforce/lwc/commit/5324101e2710e6b43ec416c370242f79cbcd0b74))
* **engine:** fixes [#203](https://github.com/salesforce/lwc/issues/203) - improving error message for iteration key ([#230](https://github.com/salesforce/lwc/issues/230)) ([4ecce8a](https://github.com/salesforce/lwc/commit/4ecce8af6407171f2a55784e130c5989c8f58a84))
* **engine:** isBeingConstructed flag is not get out of sync ([#284](https://github.com/salesforce/lwc/issues/284)) ([888bd0d](https://github.com/salesforce/lwc/commit/888bd0d2a865f16e386bee4092930b304969d04e))


### Features

* **compiler:** introduce compile/transform/bundle diagnostics ([#256](https://github.com/salesforce/lwc/issues/256)) ([950d196](https://github.com/salesforce/lwc/commit/950d19649015888f3aefef3ff390040a095ceb68))
* **engine:** addEventListener on component instance ([#276](https://github.com/salesforce/lwc/issues/276)) ([a9533af](https://github.com/salesforce/lwc/commit/a9533af9b53646787427d33113d33489bfe88b33))
* **github:** separate features and issues into separate template  ([#281](https://github.com/salesforce/lwc/issues/281)) ([b8889b0](https://github.com/salesforce/lwc/commit/b8889b05c012e1589afc184b627dbb601f03d293))


### Performance Improvements

* Increment performance iterations ([#290](https://github.com/salesforce/lwc/issues/290)) ([d436493](https://github.com/salesforce/lwc/commit/d43649342c53a1a1d99313044c3764995c22ba5c))


### Reverts

* Revert "feat(compiler): introduce compile/transform/bundle diagnostics (#256)" (#282) ([8bf1dd5](https://github.com/salesforce/lwc/commit/8bf1dd539fbf35833e182d8cf04462a193588c34)), closes [#256](https://github.com/salesforce/lwc/issues/256) [#282](https://github.com/salesforce/lwc/issues/282)



# [0.20.0](https://github.com/salesforce/lwc/compare/v0.19.0-0...v0.20.0) (2018-04-24)


### Bug Fixes

* **aom:** consolidating the aria dom property names ([#192](https://github.com/salesforce/lwc/issues/192)) ([13cd8c4](https://github.com/salesforce/lwc/commit/13cd8c43b0780a0bfc5666fcdc236289492fcb75))
* Add Safari polyfill for Proxy ([#197](https://github.com/salesforce/lwc/issues/197)) ([e9dc833](https://github.com/salesforce/lwc/commit/e9dc8332a19c89fac480e4c3082a77ec71cb9bdf))
* Misc. compat fixes ([#198](https://github.com/salesforce/lwc/issues/198)) ([480e99a](https://github.com/salesforce/lwc/commit/480e99a4a9e5541b0025038a85768e074bc80c96))
* Revert preventDefault polyfill ([#207](https://github.com/salesforce/lwc/issues/207)) ([274b81c](https://github.com/salesforce/lwc/commit/274b81c9a386841772ed81c1af7de72a9cb54e30))
* **compiler:** optional second parameter for wire decorator ([#193](https://github.com/salesforce/lwc/issues/193)) ([5eb02f0](https://github.com/salesforce/lwc/commit/5eb02f064c298a0ad34c0c30c969e25d90eefce8)), closes [#181](https://github.com/salesforce/lwc/issues/181)
* **lwc-engine:** Refactor destroy hooks to avoid leaks and guarantee disconnectedCallback ([#204](https://github.com/salesforce/lwc/issues/204)) ([f78a335](https://github.com/salesforce/lwc/commit/f78a33528bd98d5d79fbff8580658f77715e2acb))
* **wire-service:** params is always initialized as an empty object ([#179](https://github.com/salesforce/lwc/issues/179)) ([b969b5c](https://github.com/salesforce/lwc/commit/b969b5c1d7e887afe8b32906bbc8141dbb3b564a))


### Performance Improvements

* Update best ([#257](https://github.com/salesforce/lwc/issues/257)) ([aca5593](https://github.com/salesforce/lwc/commit/aca55934633a25d5ade8f718af5711640df796f7))



# [0.19.0-0](https://github.com/salesforce/lwc/compare/v0.18.1...v0.19.0-0) (2018-03-27)


### Bug Fixes

* **compiler:** Compiler errors for missing keys in iterator ([#138](https://github.com/salesforce/lwc/issues/138)) ([de8ee82](https://github.com/salesforce/lwc/commit/de8ee82bd48df3447405c668b8a0ca78632a97bb))
* **engine:** do not use global removeEventListener ([#174](https://github.com/salesforce/lwc/issues/174)) ([ac38122](https://github.com/salesforce/lwc/commit/ac3812222907f28d2831cf2a870a65691d3013e5))
* **rollup-plugin-lwc-compiler:** Removing any COMPAT code on DEV ([#158](https://github.com/salesforce/lwc/issues/158)) ([7da31a7](https://github.com/salesforce/lwc/commit/7da31a754c438c74c964557ffb47a6aa4c847349))
* **wire-service:** compat integration tests ([#178](https://github.com/salesforce/lwc/issues/178)) ([71050f8](https://github.com/salesforce/lwc/commit/71050f8bd8cb18318cc0fcfb821c18143b0027e3))


### Features

* **commits:** add pre-commit hook for msg validation ([#164](https://github.com/salesforce/lwc/issues/164)) ([13bd495](https://github.com/salesforce/lwc/commit/13bd4959037918bfb46b3a53d5fefb3a1de8bd29))
* **compiler:** Native HTML Attributes + Null removal ([#172](https://github.com/salesforce/lwc/issues/172)) ([45e27cb](https://github.com/salesforce/lwc/commit/45e27cb6f4b9a9cb0aa380b4867bcab549235945)), closes [#167](https://github.com/salesforce/lwc/issues/167) [#170](https://github.com/salesforce/lwc/issues/170)
* **engine:** adding support for composed and retargeting ([#141](https://github.com/salesforce/lwc/issues/141)) ([c89c20b](https://github.com/salesforce/lwc/commit/c89c20b85d321cc8218dc033db097ea5791c1340))
* **wire-service:** rfc implementation ([#166](https://github.com/salesforce/lwc/issues/166)) ([b1b89e0](https://github.com/salesforce/lwc/commit/b1b89e0e3078443ead7bf17257d2a996b7656a0f)), closes [#148](https://github.com/salesforce/lwc/issues/148)



## [0.18.1](https://github.com/salesforce/lwc/compare/v0.18.0...v0.18.1) (2018-03-15)


### Bug Fixes

* **lwc-engine:** Add pragma to engine artifacts ([#156](https://github.com/salesforce/lwc/issues/156)) ([f83397c](https://github.com/salesforce/lwc/commit/f83397ca02f1b98459d12ba7d2c1e9b7dd3e896d))
* **lwc-wire-service:** Fix project and playground ([#151](https://github.com/salesforce/lwc/issues/151)) ([7c91533](https://github.com/salesforce/lwc/commit/7c9153323c44c67f08e71d4df987a7d4867dd6ba))


### Features

* **engine:** issue [#153](https://github.com/salesforce/lwc/issues/153) adds a mechanism for LDS to create readonly obj ([#154](https://github.com/salesforce/lwc/issues/154)) ([3de8834](https://github.com/salesforce/lwc/commit/3de88342abddd40541321c9dcf73d8d6a0d94e21))



# [0.18.0](https://github.com/salesforce/lwc/compare/v0.17.19...v0.18.0) (2018-03-13)


### Bug Fixes

* **script:** Fix aura bin script ([#144](https://github.com/salesforce/lwc/issues/144)) ([1ff7061](https://github.com/salesforce/lwc/commit/1ff7061cdb2c35d8ad8b827c91c9f9595b0cef27))


### Features

* **compiler:** attr to props for custom LWC elements ([#102](https://github.com/salesforce/lwc/issues/102)) ([02a1320](https://github.com/salesforce/lwc/commit/02a13201e9a157dc4df6a31cb893c746a00b49ed)), closes [#119](https://github.com/salesforce/lwc/issues/119)
* **compiler:** More tooling metadata ([#132](https://github.com/salesforce/lwc/issues/132)) ([0514227](https://github.com/salesforce/lwc/commit/0514227a3587159fbdb33933e7dfb83406bc2e3d))



## [0.17.19](https://github.com/salesforce/lwc/compare/v0.17.18...v0.17.19) (2018-03-05)


### Bug Fixes

* Babel version mismatch + adding missing dependencies ([#135](https://github.com/salesforce/lwc/issues/135)) ([055f92e](https://github.com/salesforce/lwc/commit/055f92e27f8dc80f523d8f7e131961750883c0fd))



## [0.17.18](https://github.com/salesforce/lwc/compare/v0.17.16...v0.17.18) (2018-03-03)


### Bug Fixes

* **compiler:** Fix compiler bundle ([#117](https://github.com/salesforce/lwc/issues/117)) ([5a5b641](https://github.com/salesforce/lwc/commit/5a5b641497a40ba99e21bef553944153d3480c9c))
* **engine:** 0.17.17 cherry pick ([#114](https://github.com/salesforce/lwc/issues/114)) ([9cf4cdd](https://github.com/salesforce/lwc/commit/9cf4cdd7d35c6b6f6ad38bd584842a8ee123ce44)), closes [#113](https://github.com/salesforce/lwc/issues/113)
* **engine:** fixes [#90](https://github.com/salesforce/lwc/issues/90): prevent invalid values in forceTagName ([#126](https://github.com/salesforce/lwc/issues/126)) ([a992b99](https://github.com/salesforce/lwc/commit/a992b99b8df693a14a9c49cae1282f448a68ac5f))
* **rollup-plugin-lwc-compiler:** Allow rollup in COMPAT mode ([#121](https://github.com/salesforce/lwc/issues/121)) ([4afb73a](https://github.com/salesforce/lwc/commit/4afb73ab683445274d9615805c881245d1c7d5c8))
* Integration test for compat ([#134](https://github.com/salesforce/lwc/issues/134)) ([d2e2432](https://github.com/salesforce/lwc/commit/d2e2432cfe97e7622b4a102ec95c81c0f578c6f2))


### Features

* **compiler:** migrate referential integrity into lwc-compiler ([#109](https://github.com/salesforce/lwc/issues/109)) ([029e879](https://github.com/salesforce/lwc/commit/029e879f2cda583ac114359131a58e7c34148e4b))
* **engine:** Read-only escape hatch ([#128](https://github.com/salesforce/lwc/issues/128)) ([2fd26af](https://github.com/salesforce/lwc/commit/2fd26afdd1278e9af64f8d64f03460a7032cfefe))
* **git:** enforce commit message validation ([#78](https://github.com/salesforce/lwc/issues/78)) ([745e44e](https://github.com/salesforce/lwc/commit/745e44e0fa9af4658abbb9fba955f2d88f9cb5fb))



## [0.17.16](https://github.com/salesforce/lwc/compare/v0.17.15...v0.17.16) (2018-02-15)


### Bug Fixes

* **benchmarks:** Remove snabdom from yarnlock ([#80](https://github.com/salesforce/lwc/issues/80)) ([dbee555](https://github.com/salesforce/lwc/commit/dbee555374b725321ca06b76103d276d0f141158))
* **benchmarks:** Upgrade best, dedupe benchmark tests ([#92](https://github.com/salesforce/lwc/issues/92)) ([258f368](https://github.com/salesforce/lwc/commit/258f3684a60bdb2a23ca7fadabe29d345b176406))
* **compiler:** fix test-transform assert ([#77](https://github.com/salesforce/lwc/issues/77)) ([9419c58](https://github.com/salesforce/lwc/commit/9419c58ab4e0ba4026af74dc8190dfaebec30b27))
* **compiler:** invalid metadata used in decorator index ([#88](https://github.com/salesforce/lwc/issues/88)) ([93c73fe](https://github.com/salesforce/lwc/commit/93c73fe1f788db1805dabad9a31b8c647247db4c))
* **compiler:** Validate decorated properties ([#101](https://github.com/salesforce/lwc/issues/101)) ([d50e217](https://github.com/salesforce/lwc/commit/d50e217257d8266170271d6328dc4640a30069cf))


### Features

* **compiler:** compiler metadata ([#76](https://github.com/salesforce/lwc/issues/76)) ([9a57344](https://github.com/salesforce/lwc/commit/9a573443807db35d7f123bdc3b03139afd917d1f))
* **engine:** Expose element attribute methods ([#25](https://github.com/salesforce/lwc/issues/25)) ([9d9d7d9](https://github.com/salesforce/lwc/commit/9d9d7d9c5c7eb84cde42ea92aa0ae95565aa4735))
* **engine:** Implement performance timing ([#98](https://github.com/salesforce/lwc/issues/98)) ([a027300](https://github.com/salesforce/lwc/commit/a02730070a3b9bcf6d6e58d2e01c53d9c9ba8be1))
* **engine:** refactoring abstraction for create, insert, remove and render to support CE ([#97](https://github.com/salesforce/lwc/issues/97)) ([4b3b3d9](https://github.com/salesforce/lwc/commit/4b3b3d9f9ab15c45ec03db15a6b77e63e5acb535))



## [0.17.15](https://github.com/salesforce/lwc/compare/v0.17.14...v0.17.15) (2018-02-07)


### Bug Fixes

* **compiler:** allow multiple [@wire](https://github.com/wire) for different properties or methods ([#72](https://github.com/salesforce/lwc/issues/72)) ([d9223fd](https://github.com/salesforce/lwc/commit/d9223fdde31942d3bdc47a0c8257019bafe821df))


### Features

* **benchmark:** Upgrade Best ([9d7cc6f](https://github.com/salesforce/lwc/commit/9d7cc6fcc8b45ec4d936d5bd5a53f7f2eb035a6f))
* **lwc:** Upgrade yarn ([66f2773](https://github.com/salesforce/lwc/commit/66f27733a668f6e9563c3537c65e826cfdec5f95))


### Performance Improvements

* **benchmarks:** Migrate remaining benchmark to best ([#67](https://github.com/salesforce/lwc/issues/67)) ([1c05721](https://github.com/salesforce/lwc/commit/1c05721df53dd0889f7b211f2bd16978074b62a4))
* **benchmarks:** Upgrade best ([#73](https://github.com/salesforce/lwc/issues/73)) ([f815d7b](https://github.com/salesforce/lwc/commit/f815d7b68aea69224d095f15da2611838e4ba1da))



## [0.17.14](https://github.com/salesforce/lwc/compare/v0.17.13...v0.17.14) (2018-02-06)


### Bug Fixes

* **rollup-plugin-lwc-compiler:** Fix peer-dependencies ([#59](https://github.com/salesforce/lwc/issues/59)) ([90fb663](https://github.com/salesforce/lwc/commit/90fb663ec77619779bac2d5cba30497e52afb2dd))
* **transform-lwc-class:** Restrict import specifiers on engine ([#57](https://github.com/salesforce/lwc/issues/57)) ([bbb75de](https://github.com/salesforce/lwc/commit/bbb75dea14cd5855a91fafc1afe55166e3c7faa9))


### Features

* **babel-plugin-transform-lwc-class:** Transform imported decorators ([#49](https://github.com/salesforce/lwc/issues/49)) ([172c75b](https://github.com/salesforce/lwc/commit/172c75bcf5d9ff4e50256284d02f01dbec9bc07f))
* **rollup-plugin-lwc-compiler:** Default replace for prod mode ([#64](https://github.com/salesforce/lwc/issues/64)) ([7f92064](https://github.com/salesforce/lwc/commit/7f92064a49d8c7f53837996136c00f467f21d185))



## [0.17.13](https://github.com/salesforce/lwc/compare/v0.17.9...v0.17.13) (2018-02-02)


### Bug Fixes

* **engine:** Lock in uglify-es version ([#42](https://github.com/salesforce/lwc/issues/42)) ([b76e980](https://github.com/salesforce/lwc/commit/b76e98071344e50f11c94e2d7eef80a7557ee843))
* **engine:** Wrapping iframe content window in facade ([#13](https://github.com/salesforce/lwc/issues/13)) ([a29cbcd](https://github.com/salesforce/lwc/commit/a29cbcd1fc4f38a37169de1dda04e7ae3f4615ac))


### Features

* **lwc-compiler:** Remove old label syntax ([#23](https://github.com/salesforce/lwc/issues/23)) ([29cb560](https://github.com/salesforce/lwc/commit/29cb560b5bb6899beec91dca6927d3012fae6d4a))
* **proxy-compat:** Add disable compat transform pragma ([#24](https://github.com/salesforce/lwc/issues/24)) ([f10d033](https://github.com/salesforce/lwc/commit/f10d033ccfccca84c88b963028ce38ceceb89f11))
* **wire-service:** imported function identifier as adapter id for [@wire](https://github.com/wire) ([#26](https://github.com/salesforce/lwc/issues/26)) ([2c5c540](https://github.com/salesforce/lwc/commit/2c5c540d25a3055fd1c5f460ec5b16d7f2e26493))
* **wire-service:** update wire method arg to an object ([#44](https://github.com/salesforce/lwc/issues/44)) ([6eae53d](https://github.com/salesforce/lwc/commit/6eae53d65f43aeafcd181f6068bf292e4642c16c))



## [0.17.9](https://github.com/salesforce/lwc/compare/v0.17.8...v0.17.9) (2018-01-24)


### Features

* **babel-plugin-transform-lwc-class:** Revert transform imported decorators ([#27](https://github.com/salesforce/lwc/issues/27)) ([5339d5b](https://github.com/salesforce/lwc/commit/5339d5b34cc89075b20841470d6bb3d78dca4708))
* **babel-plugin-transform-lwc-class:** Transform imported decorators ([#16](https://github.com/salesforce/lwc/issues/16)) ([0a8e11f](https://github.com/salesforce/lwc/commit/0a8e11fd35dca4bb42c0fff9099dea3ff7019825))



## [0.17.8](https://github.com/salesforce/lwc/compare/v0.17.7...v0.17.8) (2018-01-17)


### Bug Fixes

* **compiler:** Allow data to be a valid prop name ([#7](https://github.com/salesforce/lwc/issues/7)) ([b5a7efd](https://github.com/salesforce/lwc/commit/b5a7efd0895b33549ec5f60a9534c0ca632c4466))
* **packages:** use conventional-changelog instead of lerna's conventional-commits ([#9](https://github.com/salesforce/lwc/issues/9)) ([ef42218](https://github.com/salesforce/lwc/commit/ef42218e1d62e1d80514b9b56f9f56f8efad22ec))



## [0.17.7](https://github.com/salesforce/lwc/compare/v0.17.6...v0.17.7) (2018-01-12)


### Bug Fixes

* Handle empty comments ([#962](https://github.com/salesforce/lwc/issues/962)) ([6bee31c](https://github.com/salesforce/lwc/commit/6bee31cc6274fda5e7513e4c77de66a4a6e1f606))
* **compat:** Do not wrap iframes in membrane ([#968](https://github.com/salesforce/lwc/issues/968)) ([2c1a88a](https://github.com/salesforce/lwc/commit/2c1a88abe10f18a997a58263c57c828e732a8d55))
* **compat form tag rendering:** Fixes issue where form tags could not be rendered ([#961](https://github.com/salesforce/lwc/issues/961)) ([c4d8484](https://github.com/salesforce/lwc/commit/c4d8484fb04a2585dc7963c641203055b9c1edb6))
* **integration tests:** Fix failing compat tests. Safari 10.1 driver fix. ([#975](https://github.com/salesforce/lwc/issues/975)) ([0d5a50c](https://github.com/salesforce/lwc/commit/0d5a50cf26b9372c6817fdf39eb8b2b69abaa16e))
* **lwc-integration:** Fix Safari10 SauceLabs config ([#978](https://github.com/salesforce/lwc/issues/978)) ([4f24752](https://github.com/salesforce/lwc/commit/4f24752e638dd1d2efd55d30350ddacc8461b9cd))
* **wire-service:** Fix wire-service es5 build and related integration tests ([#971](https://github.com/salesforce/lwc/issues/971)) ([bf91a13](https://github.com/salesforce/lwc/commit/bf91a13d929d9b1649bfb34efcc68236d0c612e7))


### Features

* **integration:** Ability to specify target browsers ([#969](https://github.com/salesforce/lwc/issues/969)) ([dd8f43b](https://github.com/salesforce/lwc/commit/dd8f43bdc9374d791bb366f6242da465772342a6))



## [0.17.6](https://github.com/salesforce/lwc/compare/v0.17.5...v0.17.6) (2017-12-26)



## [0.17.5](https://github.com/salesforce/lwc/compare/v0.17.2...v0.17.5) (2017-12-26)



## [0.17.2](https://github.com/salesforce/lwc/compare/v0.17.0...v0.17.2) (2017-12-14)



# [0.17.0](https://github.com/salesforce/lwc/compare/v0.16.5...v0.17.0) (2017-12-12)



## [0.16.5](https://github.com/salesforce/lwc/compare/v0.16.4...v0.16.5) (2017-11-17)



## [0.16.4](https://github.com/salesforce/lwc/compare/v0.16.3...v0.16.4) (2017-11-17)



## [0.16.3](https://github.com/salesforce/lwc/compare/v0.16.2...v0.16.3) (2017-11-11)



## [0.16.2](https://github.com/salesforce/lwc/compare/v0.16.1...v0.16.2) (2017-11-10)



## [0.16.1](https://github.com/salesforce/lwc/compare/v0.16.0...v0.16.1) (2017-11-10)



# [0.16.0](https://github.com/salesforce/lwc/compare/v0.15.3...v0.16.0) (2017-11-03)



## [0.15.3](https://github.com/salesforce/lwc/compare/v0.15.2...v0.15.3) (2017-10-26)



## [0.15.2](https://github.com/salesforce/lwc/compare/v0.15.1...v0.15.2) (2017-10-23)



## [0.15.1](https://github.com/salesforce/lwc/compare/v0.15.0...v0.15.1) (2017-10-22)



# [0.15.0](https://github.com/salesforce/lwc/compare/v0.14.11...v0.15.0) (2017-10-20)



## [0.14.11](https://github.com/salesforce/lwc/compare/v0.14.10...v0.14.11) (2017-10-19)



## [0.14.10](https://github.com/salesforce/lwc/compare/v0.14.9...v0.14.10) (2017-10-09)



## [0.14.9](https://github.com/salesforce/lwc/compare/v0.14.8...v0.14.9) (2017-10-06)



## [0.14.8](https://github.com/salesforce/lwc/compare/v0.14.7...v0.14.8) (2017-10-03)



## [0.14.7](https://github.com/salesforce/lwc/compare/v0.14.6...v0.14.7) (2017-10-02)



## [0.14.6](https://github.com/salesforce/lwc/compare/v0.14.5...v0.14.6) (2017-09-27)



## [0.14.5](https://github.com/salesforce/lwc/compare/v0.14.4...v0.14.5) (2017-09-25)



## [0.14.4](https://github.com/salesforce/lwc/compare/v0.14.3...v0.14.4) (2017-09-21)



## [0.14.3](https://github.com/salesforce/lwc/compare/v0.14.2...v0.14.3) (2017-09-16)



## [0.14.2](https://github.com/salesforce/lwc/compare/v0.14.1...v0.14.2) (2017-09-11)


### Reverts

* Revert "Revert "making connectedCallback, disconnnectedCallback and renderedCallback to be sync, and follow the WC semantics" (#611)" (#614) ([3c029b9](https://github.com/salesforce/lwc/commit/3c029b94cd8b725c569f9c590c6471ae90bf139c)), closes [#611](https://github.com/salesforce/lwc/issues/611) [#614](https://github.com/salesforce/lwc/issues/614)



## [0.14.1](https://github.com/salesforce/lwc/compare/v0.14.0...v0.14.1) (2017-09-08)


### Reverts

* Revert "making connectedCallback, disconnnectedCallback and renderedCallback to be sync, and follow the WC semantics" (#611) ([2d39840](https://github.com/salesforce/lwc/commit/2d39840f49821e82eaf5568a42b79812c744f86a)), closes [#611](https://github.com/salesforce/lwc/issues/611) [#552](https://github.com/salesforce/lwc/issues/552) [#598](https://github.com/salesforce/lwc/issues/598) [#558](https://github.com/salesforce/lwc/issues/558) [#587](https://github.com/salesforce/lwc/issues/587)



# [0.14.0](https://github.com/salesforce/lwc/compare/v0.13.1...v0.14.0) (2017-08-31)



## [0.13.1](https://github.com/salesforce/lwc/compare/v0.13.0...v0.13.1) (2017-08-01)



# [0.13.0](https://github.com/salesforce/lwc/compare/v0.12.4...v0.13.0) (2017-07-30)



## [0.12.4](https://github.com/salesforce/lwc/compare/v0.12.3...v0.12.4) (2017-07-14)



## [0.12.3](https://github.com/salesforce/lwc/compare/v0.12.2...v0.12.3) (2017-07-08)



## [0.12.2](https://github.com/salesforce/lwc/compare/v0.12.1...v0.12.2) (2017-07-06)



## [0.12.1](https://github.com/salesforce/lwc/compare/v0.12.0...v0.12.1) (2017-07-06)



# [0.12.0](https://github.com/salesforce/lwc/compare/v0.11.9...v0.12.0) (2017-07-05)



## [0.11.9](https://github.com/salesforce/lwc/compare/v0.11.8...v0.11.9) (2017-06-24)



## [0.11.8](https://github.com/salesforce/lwc/compare/v0.11.7...v0.11.8) (2017-06-24)



## [0.11.7](https://github.com/salesforce/lwc/compare/v0.11.5...v0.11.7) (2017-06-20)



## [0.11.5](https://github.com/salesforce/lwc/compare/v0.11.4...v0.11.5) (2017-06-20)



## [0.11.4](https://github.com/salesforce/lwc/compare/v0.11.3...v0.11.4) (2017-06-15)



## [0.11.3](https://github.com/salesforce/lwc/compare/v0.11.2...v0.11.3) (2017-06-13)



## [0.11.2](https://github.com/salesforce/lwc/compare/v0.11.1...v0.11.2) (2017-06-13)



## [0.11.1](https://github.com/salesforce/lwc/compare/v0.10.5...v0.11.1) (2017-06-13)



## [0.10.5](https://github.com/salesforce/lwc/compare/v0.10.3...v0.10.5) (2017-06-05)



## [0.10.3](https://github.com/salesforce/lwc/compare/v0.10.2...v0.10.3) (2017-05-24)



## [0.10.2](https://github.com/salesforce/lwc/compare/v0.10.1...v0.10.2) (2017-05-23)



## [0.10.1](https://github.com/salesforce/lwc/compare/v0.10.0...v0.10.1) (2017-05-23)



# [0.10.0](https://github.com/salesforce/lwc/compare/v0.9.1...v0.10.0) (2017-05-23)



## [0.9.1](https://github.com/salesforce/lwc/compare/v0.9.0...v0.9.1) (2017-05-09)



# [0.9.0](https://github.com/salesforce/lwc/compare/v0.8.1...v0.9.0) (2017-05-08)



## [0.8.1](https://github.com/salesforce/lwc/compare/v0.8.0...v0.8.1) (2017-04-15)



# [0.8.0](https://github.com/salesforce/lwc/compare/v0.7.1...v0.8.0) (2017-04-14)



## [0.7.1](https://github.com/salesforce/lwc/compare/v0.7.0-rc...v0.7.1) (2017-04-10)



# [0.7.0-rc](https://github.com/salesforce/lwc/compare/v0.7.0...v0.7.0-rc) (2017-04-10)



# [0.7.0](https://github.com/salesforce/lwc/compare/v0.6.3...v0.7.0) (2017-04-10)



## [0.6.3](https://github.com/salesforce/lwc/compare/v0.6.2...v0.6.3) (2017-04-06)



## [0.6.2](https://github.com/salesforce/lwc/compare/v0.6.1...v0.6.2) (2017-04-04)



## [0.6.1](https://github.com/salesforce/lwc/compare/v0.6.0...v0.6.1) (2017-03-31)



# [0.6.0](https://github.com/salesforce/lwc/compare/v0.5.1...v0.6.0) (2017-03-29)



## [0.5.1](https://github.com/salesforce/lwc/compare/v0.5.0...v0.5.1) (2017-03-28)



# [0.5.0](https://github.com/salesforce/lwc/compare/v0.4.10...v0.5.0) (2017-03-21)



## [0.4.10](https://github.com/salesforce/lwc/compare/v0.4.9...v0.4.10) (2017-03-15)



## [0.4.9](https://github.com/salesforce/lwc/compare/v0.4.8...v0.4.9) (2017-03-15)



## [0.4.8](https://github.com/salesforce/lwc/compare/v0.4.7...v0.4.8) (2017-03-15)



## [0.4.7](https://github.com/salesforce/lwc/compare/v0.4.6...v0.4.7) (2017-03-14)



## [0.4.6](https://github.com/salesforce/lwc/compare/v0.4.5...v0.4.6) (2017-03-14)



## [0.4.5](https://github.com/salesforce/lwc/compare/v0.4.4...v0.4.5) (2017-03-14)



## [0.4.4](https://github.com/salesforce/lwc/compare/v0.4.3...v0.4.4) (2017-03-13)



## [0.4.3](https://github.com/salesforce/lwc/compare/v0.4.2...v0.4.3) (2017-03-13)



## [0.4.2](https://github.com/salesforce/lwc/compare/v0.4.1...v0.4.2) (2017-03-13)



## 0.4.1 (2017-03-11)



