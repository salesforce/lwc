<a name=""></a>
# [](https://github.com/salesforce/lwc/compare/v0.17.19...v) (2018-03-05)



<a name="0.17.19"></a>
## [0.17.19](https://github.com/salesforce/lwc/compare/v0.17.18...v0.17.19) (2018-03-05)


### Bug Fixes

* Babel version mismatch + adding missing dependencies ([#135](https://github.com/salesforce/lwc/issues/135)) ([055f92e](https://github.com/salesforce/lwc/commit/055f92e))



<a name="0.17.18"></a>
## [0.17.18](https://github.com/salesforce/lwc/compare/v0.17.16...v0.17.18) (2018-03-03)


### Bug Fixes

* **compiler:** Fix compiler bundle ([#117](https://github.com/salesforce/lwc/issues/117)) ([5a5b641](https://github.com/salesforce/lwc/commit/5a5b641))
* **engine:** 0.17.17 cherry pick ([#114](https://github.com/salesforce/lwc/issues/114)) ([9cf4cdd](https://github.com/salesforce/lwc/commit/9cf4cdd)), closes [#113](https://github.com/salesforce/lwc/issues/113)
* **engine:** fixes [#90](https://github.com/salesforce/lwc/issues/90): prevent invalid values in forceTagName ([#126](https://github.com/salesforce/lwc/issues/126)) ([a992b99](https://github.com/salesforce/lwc/commit/a992b99))
* **rollup-plugin-lwc-compiler:** Allow rollup in COMPAT mode ([#121](https://github.com/salesforce/lwc/issues/121)) ([4afb73a](https://github.com/salesforce/lwc/commit/4afb73a))
* Integration test for compat ([#134](https://github.com/salesforce/lwc/issues/134)) ([d2e2432](https://github.com/salesforce/lwc/commit/d2e2432))


### Features

* **compiler:** migrate referential integrity into lwc-compiler ([#109](https://github.com/salesforce/lwc/issues/109)) ([029e879](https://github.com/salesforce/lwc/commit/029e879))
* **engine:** Read-only escape hatch ([#128](https://github.com/salesforce/lwc/issues/128)) ([2fd26af](https://github.com/salesforce/lwc/commit/2fd26af))
* **git:** enforce commit message validation ([#78](https://github.com/salesforce/lwc/issues/78)) ([745e44e](https://github.com/salesforce/lwc/commit/745e44e))



<a name="0.17.16"></a>
## [0.17.16](https://github.com/salesforce/lwc/compare/v0.17.15...v0.17.16) (2018-02-15)


### Bug Fixes

* **benchmarks:** Remove snabdom from yarnlock ([#80](https://github.com/salesforce/lwc/issues/80)) ([dbee555](https://github.com/salesforce/lwc/commit/dbee555))
* **benchmarks:** Upgrade best, dedupe benchmark tests ([#92](https://github.com/salesforce/lwc/issues/92)) ([258f368](https://github.com/salesforce/lwc/commit/258f368))
* **compiler:** fix test-transform assert ([#77](https://github.com/salesforce/lwc/issues/77)) ([9419c58](https://github.com/salesforce/lwc/commit/9419c58))
* **compiler:** invalid metadata used in decorator index ([#88](https://github.com/salesforce/lwc/issues/88)) ([93c73fe](https://github.com/salesforce/lwc/commit/93c73fe))
* **compiler:** Validate decorated properties ([#101](https://github.com/salesforce/lwc/issues/101)) ([d50e217](https://github.com/salesforce/lwc/commit/d50e217))


### Features

* **compiler:** compiler metadata ([#76](https://github.com/salesforce/lwc/issues/76)) ([9a57344](https://github.com/salesforce/lwc/commit/9a57344))
* **engine:** Expose element attribute methods ([#25](https://github.com/salesforce/lwc/issues/25)) ([9d9d7d9](https://github.com/salesforce/lwc/commit/9d9d7d9))
* **engine:** Implement performance timing ([#98](https://github.com/salesforce/lwc/issues/98)) ([a027300](https://github.com/salesforce/lwc/commit/a027300))
* **engine:** refactoring abstraction for create, insert, remove and render to support CE ([#97](https://github.com/salesforce/lwc/issues/97)) ([4b3b3d9](https://github.com/salesforce/lwc/commit/4b3b3d9))



<a name="0.17.15"></a>
## [0.17.15](https://github.com/salesforce/lwc/compare/v0.17.14...v0.17.15) (2018-02-07)


### Bug Fixes

* **compiler:** allow multiple [@wire](https://github.com/wire) for different properties or methods ([#72](https://github.com/salesforce/lwc/issues/72)) ([d9223fd](https://github.com/salesforce/lwc/commit/d9223fd))


### Features

* **benchmark:** Upgrade Best ([9d7cc6f](https://github.com/salesforce/lwc/commit/9d7cc6f))
* **lwc:** Upgrade yarn ([66f2773](https://github.com/salesforce/lwc/commit/66f2773))


### Performance Improvements

* **benchmarks:** Migrate remaining benchmark to best ([#67](https://github.com/salesforce/lwc/issues/67)) ([1c05721](https://github.com/salesforce/lwc/commit/1c05721))
* **benchmarks:** Upgrade best ([#73](https://github.com/salesforce/lwc/issues/73)) ([f815d7b](https://github.com/salesforce/lwc/commit/f815d7b))



<a name="0.17.14"></a>
## [0.17.14](https://github.com/salesforce/lwc/compare/v0.17.13...v0.17.14) (2018-02-06)


### Bug Fixes

* **rollup-plugin-lwc-compiler:** Fix peer-dependencies ([#59](https://github.com/salesforce/lwc/issues/59)) ([90fb663](https://github.com/salesforce/lwc/commit/90fb663))
* **transform-lwc-class:** Restrict import specifiers on engine ([#57](https://github.com/salesforce/lwc/issues/57)) ([bbb75de](https://github.com/salesforce/lwc/commit/bbb75de))


### Features

* **babel-plugin-transform-lwc-class:** Transform imported decorators ([#49](https://github.com/salesforce/lwc/issues/49)) ([172c75b](https://github.com/salesforce/lwc/commit/172c75b))
* **rollup-plugin-lwc-compiler:** Default replace for prod mode ([#64](https://github.com/salesforce/lwc/issues/64)) ([7f92064](https://github.com/salesforce/lwc/commit/7f92064))



<a name="0.17.13"></a>
## [0.17.13](https://github.com/salesforce/lwc/compare/v0.17.9...v0.17.13) (2018-02-02)


### Bug Fixes

* **engine:** Lock in uglify-es version ([#42](https://github.com/salesforce/lwc/issues/42)) ([b76e980](https://github.com/salesforce/lwc/commit/b76e980))
* **engine:** Wrapping iframe content window in facade ([#13](https://github.com/salesforce/lwc/issues/13)) ([a29cbcd](https://github.com/salesforce/lwc/commit/a29cbcd))


### Features

* **lwc-compiler:** Remove old label syntax ([#23](https://github.com/salesforce/lwc/issues/23)) ([29cb560](https://github.com/salesforce/lwc/commit/29cb560))
* **proxy-compat:** Add disable compat transform pragma ([#24](https://github.com/salesforce/lwc/issues/24)) ([f10d033](https://github.com/salesforce/lwc/commit/f10d033))
* **wire-service:** imported function identifier as adapter id for [@wire](https://github.com/wire) ([#26](https://github.com/salesforce/lwc/issues/26)) ([2c5c540](https://github.com/salesforce/lwc/commit/2c5c540))
* **wire-service:** update wire method arg to an object ([#44](https://github.com/salesforce/lwc/issues/44)) ([6eae53d](https://github.com/salesforce/lwc/commit/6eae53d))



<a name="0.17.9"></a>
## [0.17.9](https://github.com/salesforce/lwc/compare/v0.17.8...v0.17.9) (2018-01-24)


### Features

* **babel-plugin-transform-lwc-class:** Revert transform imported decorators ([#27](https://github.com/salesforce/lwc/issues/27)) ([5339d5b](https://github.com/salesforce/lwc/commit/5339d5b))
* **babel-plugin-transform-lwc-class:** Transform imported decorators ([#16](https://github.com/salesforce/lwc/issues/16)) ([0a8e11f](https://github.com/salesforce/lwc/commit/0a8e11f))



<a name="0.17.8"></a>
## [0.17.8](https://github.com/salesforce/lwc/compare/v0.17.7...v0.17.8) (2018-01-17)


### Bug Fixes

* **compiler:** Allow data to be a valid prop name ([#7](https://github.com/salesforce/lwc/issues/7)) ([b5a7efd](https://github.com/salesforce/lwc/commit/b5a7efd))
* **packages:** use conventional-changelog instead of lerna's conventional-commits ([#9](https://github.com/salesforce/lwc/issues/9)) ([ef42218](https://github.com/salesforce/lwc/commit/ef42218))



<a name="0.17.7"></a>
## [0.17.7](https://github.com/salesforce/lwc/compare/v0.17.6...v0.17.7) (2018-01-12)


### Bug Fixes

* Handle empty comments ([#962](https://github.com/salesforce/lwc/issues/962)) ([6bee31c](https://github.com/salesforce/lwc/commit/6bee31c))
* **compat:** Do not wrap iframes in membrane ([#968](https://github.com/salesforce/lwc/issues/968)) ([2c1a88a](https://github.com/salesforce/lwc/commit/2c1a88a))
* **compat form tag rendering:** Fixes issue where form tags could not be rendered ([#961](https://github.com/salesforce/lwc/issues/961)) ([c4d8484](https://github.com/salesforce/lwc/commit/c4d8484))
* **integration tests:** Fix failing compat tests. Safari 10.1 driver fix. ([#975](https://github.com/salesforce/lwc/issues/975)) ([0d5a50c](https://github.com/salesforce/lwc/commit/0d5a50c))
* **lwc-integration:** Fix Safari10 SauceLabs config ([#978](https://github.com/salesforce/lwc/issues/978)) ([4f24752](https://github.com/salesforce/lwc/commit/4f24752))
* **wire-service:** Fix wire-service es5 build and related integration tests ([#971](https://github.com/salesforce/lwc/issues/971)) ([bf91a13](https://github.com/salesforce/lwc/commit/bf91a13))


### Features

* **integration:** Ability to specify target browsers ([#969](https://github.com/salesforce/lwc/issues/969)) ([dd8f43b](https://github.com/salesforce/lwc/commit/dd8f43b))



<a name="0.17.6"></a>
## [0.17.6](https://github.com/salesforce/lwc/compare/v0.17.5...v0.17.6) (2017-12-26)



<a name="0.17.5"></a>
## [0.17.5](https://github.com/salesforce/lwc/compare/v0.17.3...v0.17.5) (2017-12-26)



<a name="0.17.3"></a>
## [0.17.3](https://github.com/salesforce/lwc/compare/v0.17.2...v0.17.3) (2017-12-16)



<a name="0.17.2"></a>
## [0.17.2](https://github.com/salesforce/lwc/compare/v0.17.0...v0.17.2) (2017-12-14)



<a name="0.17.0"></a>
# [0.17.0](https://github.com/salesforce/lwc/compare/v0.16.5...v0.17.0) (2017-12-12)



<a name="0.16.5"></a>
## [0.16.5](https://github.com/salesforce/lwc/compare/v0.16.4...v0.16.5) (2017-11-17)



<a name="0.16.4"></a>
## [0.16.4](https://github.com/salesforce/lwc/compare/v0.16.3...v0.16.4) (2017-11-17)



<a name="0.16.3"></a>
## [0.16.3](https://github.com/salesforce/lwc/compare/v0.16.2...v0.16.3) (2017-11-11)



<a name="0.16.2"></a>
## [0.16.2](https://github.com/salesforce/lwc/compare/v0.16.1...v0.16.2) (2017-11-10)



<a name="0.16.1"></a>
## [0.16.1](https://github.com/salesforce/lwc/compare/v0.16.0...v0.16.1) (2017-11-10)



<a name="0.16.0"></a>
# [0.16.0](https://github.com/salesforce/lwc/compare/v0.15.3...v0.16.0) (2017-11-03)



<a name="0.15.3"></a>
## [0.15.3](https://github.com/salesforce/lwc/compare/v0.15.2...v0.15.3) (2017-10-26)



<a name="0.15.2"></a>
## [0.15.2](https://github.com/salesforce/lwc/compare/v0.15.1...v0.15.2) (2017-10-23)



<a name="0.15.1"></a>
## [0.15.1](https://github.com/salesforce/lwc/compare/v0.15.0...v0.15.1) (2017-10-22)



<a name="0.15.0"></a>
# [0.15.0](https://github.com/salesforce/lwc/compare/v0.14.11...v0.15.0) (2017-10-20)



<a name="0.14.11"></a>
## [0.14.11](https://github.com/salesforce/lwc/compare/v0.14.10...v0.14.11) (2017-10-19)



<a name="0.14.10"></a>
## [0.14.10](https://github.com/salesforce/lwc/compare/v0.14.9...v0.14.10) (2017-10-09)



<a name="0.14.9"></a>
## [0.14.9](https://github.com/salesforce/lwc/compare/v0.14.8...v0.14.9) (2017-10-06)



<a name="0.14.8"></a>
## [0.14.8](https://github.com/salesforce/lwc/compare/v0.14.7...v0.14.8) (2017-10-03)



<a name="0.14.7"></a>
## [0.14.7](https://github.com/salesforce/lwc/compare/v0.14.6...v0.14.7) (2017-10-02)



<a name="0.14.6"></a>
## [0.14.6](https://github.com/salesforce/lwc/compare/v0.14.5...v0.14.6) (2017-09-27)



<a name="0.14.5"></a>
## [0.14.5](https://github.com/salesforce/lwc/compare/v0.14.4...v0.14.5) (2017-09-25)



<a name="0.14.4"></a>
## [0.14.4](https://github.com/salesforce/lwc/compare/v0.14.3...v0.14.4) (2017-09-21)



<a name="0.14.3"></a>
## [0.14.3](https://github.com/salesforce/lwc/compare/v0.14.2...v0.14.3) (2017-09-16)



<a name="0.14.2"></a>
## [0.14.2](https://github.com/salesforce/lwc/compare/v0.14.1...v0.14.2) (2017-09-11)



<a name="0.14.1"></a>
## [0.14.1](https://github.com/salesforce/lwc/compare/v0.14.0...v0.14.1) (2017-09-08)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/salesforce/lwc/compare/v0.13.1...v0.14.0) (2017-08-31)



<a name="0.13.1"></a>
## [0.13.1](https://github.com/salesforce/lwc/compare/v0.13.0...v0.13.1) (2017-08-01)



<a name="0.13.0"></a>
# [0.13.0](https://github.com/salesforce/lwc/compare/v0.12.4...v0.13.0) (2017-07-30)



<a name="0.12.4"></a>
## [0.12.4](https://github.com/salesforce/lwc/compare/v0.12.3...v0.12.4) (2017-07-14)



<a name="0.12.3"></a>
## [0.12.3](https://github.com/salesforce/lwc/compare/v0.12.2...v0.12.3) (2017-07-08)



<a name="0.12.2"></a>
## [0.12.2](https://github.com/salesforce/lwc/compare/v0.12.1...v0.12.2) (2017-07-06)



<a name="0.12.1"></a>
## [0.12.1](https://github.com/salesforce/lwc/compare/v0.12.0...v0.12.1) (2017-07-06)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/salesforce/lwc/compare/v0.11.9...v0.12.0) (2017-07-05)



<a name="0.11.9"></a>
## [0.11.9](https://github.com/salesforce/lwc/compare/v0.11.8...v0.11.9) (2017-06-24)



<a name="0.11.8"></a>
## [0.11.8](https://github.com/salesforce/lwc/compare/v0.11.7...v0.11.8) (2017-06-24)



<a name="0.11.7"></a>
## [0.11.7](https://github.com/salesforce/lwc/compare/v0.11.5...v0.11.7) (2017-06-20)



<a name="0.11.5"></a>
## [0.11.5](https://github.com/salesforce/lwc/compare/v0.11.4...v0.11.5) (2017-06-20)



<a name="0.11.4"></a>
## [0.11.4](https://github.com/salesforce/lwc/compare/v0.11.3...v0.11.4) (2017-06-15)



<a name="0.11.3"></a>
## [0.11.3](https://github.com/salesforce/lwc/compare/v0.11.2...v0.11.3) (2017-06-13)



<a name="0.11.2"></a>
## [0.11.2](https://github.com/salesforce/lwc/compare/v0.11.1...v0.11.2) (2017-06-13)



<a name="0.11.1"></a>
## [0.11.1](https://github.com/salesforce/lwc/compare/v0.10.5...v0.11.1) (2017-06-13)



<a name="0.10.5"></a>
## [0.10.5](https://github.com/salesforce/lwc/compare/v0.10.3...v0.10.5) (2017-06-05)



<a name="0.10.3"></a>
## [0.10.3](https://github.com/salesforce/lwc/compare/v0.10.2...v0.10.3) (2017-05-24)



<a name="0.10.2"></a>
## [0.10.2](https://github.com/salesforce/lwc/compare/v0.10.1...v0.10.2) (2017-05-23)



<a name="0.10.1"></a>
## [0.10.1](https://github.com/salesforce/lwc/compare/v0.10.0...v0.10.1) (2017-05-23)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/salesforce/lwc/compare/v0.9.1...v0.10.0) (2017-05-23)



<a name="0.9.1"></a>
## [0.9.1](https://github.com/salesforce/lwc/compare/v0.9.0...v0.9.1) (2017-05-09)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/salesforce/lwc/compare/v0.8.1...v0.9.0) (2017-05-08)



<a name="0.8.1"></a>
## [0.8.1](https://github.com/salesforce/lwc/compare/v0.8.0...v0.8.1) (2017-04-15)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/salesforce/lwc/compare/v0.7.1...v0.8.0) (2017-04-14)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/salesforce/lwc/compare/v0.7.0-rc...v0.7.1) (2017-04-10)



<a name="0.7.0-rc"></a>
# [0.7.0-rc](https://github.com/salesforce/lwc/compare/v0.7.0...v0.7.0-rc) (2017-04-10)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/salesforce/lwc/compare/v0.6.3...v0.7.0) (2017-04-10)



<a name="0.6.3"></a>
## [0.6.3](https://github.com/salesforce/lwc/compare/v0.6.2...v0.6.3) (2017-04-06)



<a name="0.6.2"></a>
## [0.6.2](https://github.com/salesforce/lwc/compare/v0.6.1...v0.6.2) (2017-04-04)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/salesforce/lwc/compare/v0.6.0...v0.6.1) (2017-03-31)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/salesforce/lwc/compare/v0.5.1...v0.6.0) (2017-03-29)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/salesforce/lwc/compare/v0.5.0...v0.5.1) (2017-03-28)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/salesforce/lwc/compare/v0.4.10...v0.5.0) (2017-03-21)



<a name="0.4.10"></a>
## [0.4.10](https://github.com/salesforce/lwc/compare/v0.4.9...v0.4.10) (2017-03-15)



<a name="0.4.9"></a>
## [0.4.9](https://github.com/salesforce/lwc/compare/v0.4.8...v0.4.9) (2017-03-15)



<a name="0.4.8"></a>
## [0.4.8](https://github.com/salesforce/lwc/compare/v0.4.7...v0.4.8) (2017-03-15)



<a name="0.4.7"></a>
## [0.4.7](https://github.com/salesforce/lwc/compare/v0.4.6...v0.4.7) (2017-03-14)



<a name="0.4.6"></a>
## [0.4.6](https://github.com/salesforce/lwc/compare/v0.4.5...v0.4.6) (2017-03-14)



<a name="0.4.5"></a>
## [0.4.5](https://github.com/salesforce/lwc/compare/v0.4.4...v0.4.5) (2017-03-14)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/salesforce/lwc/compare/v0.4.3...v0.4.4) (2017-03-13)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/salesforce/lwc/compare/v0.4.2...v0.4.3) (2017-03-13)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/salesforce/lwc/compare/v0.4.1...v0.4.2) (2017-03-13)



<a name="0.4.1"></a>
## 0.4.1 (2017-03-11)



