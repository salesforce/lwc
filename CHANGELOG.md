<a name=""></a>
# [](https://github.com/salesforce/lwc/compare/v0.38.1...v) (2019-05-01)



<a name="0.38.1"></a>
## [0.38.1](https://github.com/salesforce/lwc/compare/v0.38.0...v0.38.1) (2019-04-30)



<a name="0.38.0"></a>
# [0.38.0](https://github.com/salesforce/lwc/compare/v0.37.2...v0.38.0) (2019-04-30)


### Bug Fixes

* add `allow` as a valid iframe attribute ([#1156](https://github.com/salesforce/lwc/issues/1156)) ([74a42fc](https://github.com/salesforce/lwc/commit/74a42fc))
* fix event tests to be shadow aware ([#1182](https://github.com/salesforce/lwc/issues/1182)) ([3cd1191](https://github.com/salesforce/lwc/commit/3cd1191))
* **compiler:** add default export support and enable strict mode ([#1175](https://github.com/salesforce/lwc/issues/1175)) ([a429824](https://github.com/salesforce/lwc/commit/a429824))
* **compiler:** don't use project-wide config ([#1163](https://github.com/salesforce/lwc/issues/1163)) ([1477d56](https://github.com/salesforce/lwc/commit/1477d56))
* **engine:** add instaceof check workaround ([#1165](https://github.com/salesforce/lwc/issues/1165)) ([5490be7](https://github.com/salesforce/lwc/commit/5490be7))
* **engine:** restrict access to ShadowRoot.dispatchEvent ([#1176](https://github.com/salesforce/lwc/issues/1176)) ([01a6506](https://github.com/salesforce/lwc/commit/01a6506))
* **engine:** supporting objects with null prototype in iterators ([#1152](https://github.com/salesforce/lwc/issues/1152)) ([7c5f264](https://github.com/salesforce/lwc/commit/7c5f264))
* **resolver:** use require.resolve.paths(); avoid require for json ([#1194](https://github.com/salesforce/lwc/issues/1194)) ([7ef45df](https://github.com/salesforce/lwc/commit/7ef45df))
* incorrect import in dist type in [@lwc](https://github.com/lwc)/compiler ([#1196](https://github.com/salesforce/lwc/issues/1196)) ([0ed106b](https://github.com/salesforce/lwc/commit/0ed106b))


### Features

* **compiler:** expose transformSync method ([#1174](https://github.com/salesforce/lwc/issues/1174)) ([ebeb23a](https://github.com/salesforce/lwc/commit/ebeb23a))


### Performance Improvements

* optimize module resolution ([#1183](https://github.com/salesforce/lwc/issues/1183)) ([81ffabf](https://github.com/salesforce/lwc/commit/81ffabf)), closes [#1162](https://github.com/salesforce/lwc/issues/1162)



<a name="0.37.2"></a>
## [0.37.2](https://github.com/salesforce/lwc/compare/v0.37.1...v0.37.2) (2019-04-01)


### Bug Fixes

* **engine:** Make engine more resilient to invalid constructors ([#1121](https://github.com/salesforce/lwc/issues/1121)) ([fee643c](https://github.com/salesforce/lwc/commit/fee643c))
* **module-resolver:** protect against invalid package.json ([#1146](https://github.com/salesforce/lwc/issues/1146)) ([906ac64](https://github.com/salesforce/lwc/commit/906ac64))
* **template-compiler:** restrict srcdoc attribute on all iframe element ([#1137](https://github.com/salesforce/lwc/issues/1137)) ([3aff1a5](https://github.com/salesforce/lwc/commit/3aff1a5))
* unify the descriptor creation process for restrictions ([#1144](https://github.com/salesforce/lwc/issues/1144)) ([bfb577e](https://github.com/salesforce/lwc/commit/bfb577e))
* use patched MutationObserver to key portal elements ([#1147](https://github.com/salesforce/lwc/issues/1147)) ([5c97354](https://github.com/salesforce/lwc/commit/5c97354)), closes [#1022](https://github.com/salesforce/lwc/issues/1022)


### Features

* allow typescript file extension ([#1135](https://github.com/salesforce/lwc/issues/1135)) ([4acd1d3](https://github.com/salesforce/lwc/commit/4acd1d3))



<a name="0.37.1"></a>
## [0.37.1](https://github.com/salesforce/lwc/compare/v0.37.0...v0.37.1) (2019-03-27)


### Bug Fixes

* **babel-plugin-component:** correct class member decorator validation  ([#1122](https://github.com/salesforce/lwc/issues/1122)) ([22ec3d5](https://github.com/salesforce/lwc/commit/22ec3d5))
* use observable-membrane v0.26.1 ([#1111](https://github.com/salesforce/lwc/issues/1111)) ([df0e91f](https://github.com/salesforce/lwc/commit/df0e91f))
* **engine:** prevent focus events when engine manages focus ([#1116](https://github.com/salesforce/lwc/issues/1116)) ([477c5cf](https://github.com/salesforce/lwc/commit/477c5cf))
* **jest-transformer:** add babel-preset-jest dependency ([#1112](https://github.com/salesforce/lwc/issues/1112)) ([1f12803](https://github.com/salesforce/lwc/commit/1f12803))



<a name="0.37.0"></a>
# [0.37.0](https://github.com/salesforce/lwc/compare/v0.36.0...v0.37.0) (2019-03-08)


### Bug Fixes

* include fragment only urls when scoping idrefs ([#1085](https://github.com/salesforce/lwc/issues/1085)) ([4d54d08](https://github.com/salesforce/lwc/commit/4d54d08))
* **babel-plugin-component:** validate wire adapter import ([#1096](https://github.com/salesforce/lwc/issues/1096)) ([e3525d5](https://github.com/salesforce/lwc/commit/e3525d5))
* patch behavior of Node.prototype.getRootNode ([#1083](https://github.com/salesforce/lwc/issues/1083)) ([9f998e8](https://github.com/salesforce/lwc/commit/9f998e8))


### Features

* **style-compiler:** add support for :dir pseudo class ([#1099](https://github.com/salesforce/lwc/issues/1099)) ([fe3206c](https://github.com/salesforce/lwc/commit/fe3206c))


### Performance Improvements

* **engine:** optimize vm object to initialize all the fields in advance ([#1098](https://github.com/salesforce/lwc/issues/1098)) ([8b0f9d3](https://github.com/salesforce/lwc/commit/8b0f9d3))



<a name="0.36.0"></a>
# [0.36.0](https://github.com/salesforce/lwc/compare/v0.35.12...v0.36.0) (2019-03-06)


### Bug Fixes

* **jest-transformer:** apex import mocks to use named functions ([#1093](https://github.com/salesforce/lwc/issues/1093)) ([c2c1097](https://github.com/salesforce/lwc/commit/c2c1097))
* **wire-service:** add lifecycle hook guards ([#1092](https://github.com/salesforce/lwc/issues/1092)) ([dfa87d1](https://github.com/salesforce/lwc/commit/dfa87d1))



<a name="0.35.12"></a>
## [0.35.12](https://github.com/salesforce/lwc/compare/v0.35.11...v0.35.12) (2019-03-05)


### Bug Fixes

* properly exit the state entered when clicking into shadows ([#1082](https://github.com/salesforce/lwc/issues/1082)) ([d20fdda](https://github.com/salesforce/lwc/commit/d20fdda))
* **engine:** error boundary fix for non-inserted slotted custom elements ([#1090](https://github.com/salesforce/lwc/issues/1090)) ([3b3c278](https://github.com/salesforce/lwc/commit/3b3c278))



<a name="0.35.11"></a>
## [0.35.11](https://github.com/salesforce/lwc/compare/v0.35.10...v0.35.11) (2019-02-27)


### Bug Fixes

* **engine:** Error boundary improvement ([#937](https://github.com/salesforce/lwc/issues/937)) ([796997d](https://github.com/salesforce/lwc/commit/796997d))
* **test-utils:** deprecate getShadowRoot API ([#1069](https://github.com/salesforce/lwc/issues/1069)) ([59298cd](https://github.com/salesforce/lwc/commit/59298cd))


### Features

* patch MutationObserver to be aware of synthetic shadow dom ([#1046](https://github.com/salesforce/lwc/issues/1046)) ([e80c0cc](https://github.com/salesforce/lwc/commit/e80c0cc))



<a name="0.35.10"></a>
## [0.35.10](https://github.com/salesforce/lwc/compare/v0.35.9...v0.35.10) (2019-02-26)


### Bug Fixes

* update types for shadow root ([#1077](https://github.com/salesforce/lwc/issues/1077)) ([7d4dee2](https://github.com/salesforce/lwc/commit/7d4dee2))



<a name="0.35.9"></a>
## [0.35.9](https://github.com/salesforce/lwc/compare/v0.35.7...v0.35.9) (2019-02-22)


### Bug Fixes

* **engine:** component name in performance marks ([#1021](https://github.com/salesforce/lwc/issues/1021)) ([25ed4c2](https://github.com/salesforce/lwc/commit/25ed4c2))
* **engine:** Node.compareDocumentPosition spec implication issues ([#1063](https://github.com/salesforce/lwc/issues/1063)) ([cbd210e](https://github.com/salesforce/lwc/commit/cbd210e))
* move mutation observer to its own modules ([#1068](https://github.com/salesforce/lwc/issues/1068)) ([812c0ce](https://github.com/salesforce/lwc/commit/812c0ce))


### Features

* **compiler:** remove import locations metadata ([#1047](https://github.com/salesforce/lwc/issues/1047)) ([80e6816](https://github.com/salesforce/lwc/commit/80e6816))
* add apexContinuation transformer ([#1074](https://github.com/salesforce/lwc/issues/1074)) ([01ce6c3](https://github.com/salesforce/lwc/commit/01ce6c3))



<a name="0.35.7"></a>
## [0.35.7](https://github.com/salesforce/lwc/compare/v0.35.6...v0.35.7) (2019-02-14)


### Bug Fixes

* **style-compiler:** invalid at-rules transformations ([#1042](https://github.com/salesforce/lwc/issues/1042)) ([d97cc22](https://github.com/salesforce/lwc/commit/d97cc22))


### Features

* **babel-plugin-component:** remove decorator meta collection ([#1016](https://github.com/salesforce/lwc/issues/1016)) ([f5a3a71](https://github.com/salesforce/lwc/commit/f5a3a71))



<a name="0.35.6"></a>
## [0.35.6](https://github.com/salesforce/lwc/compare/v0.35.5...v0.35.6) (2019-02-06)


### Bug Fixes

* fix condition for extracting children getter ([#1039](https://github.com/salesforce/lwc/issues/1039)) ([b9a3237](https://github.com/salesforce/lwc/commit/b9a3237))



<a name="0.35.5"></a>
## [0.35.5](https://github.com/salesforce/lwc/compare/v0.35.4...v0.35.5) (2019-01-28)


### Bug Fixes

* **engine:** aria reflection new prop and typo ([#1012](https://github.com/salesforce/lwc/issues/1012)) ([87d211c](https://github.com/salesforce/lwc/commit/87d211c))
* **engine:** fixes issue [#972](https://github.com/salesforce/lwc/issues/972) - getRootNode on shadows ([#1002](https://github.com/salesforce/lwc/issues/1002)) ([bd77365](https://github.com/salesforce/lwc/commit/bd77365))
* **engine:** issue [#976](https://github.com/salesforce/lwc/issues/976) ShadowRoot.contains() ([#1000](https://github.com/salesforce/lwc/issues/1000)) ([f8423e8](https://github.com/salesforce/lwc/commit/f8423e8))
* **engine:** issue [#988](https://github.com/salesforce/lwc/issues/988) ShadowRoot unknown properties ([#999](https://github.com/salesforce/lwc/issues/999)) ([fbfa0b5](https://github.com/salesforce/lwc/commit/fbfa0b5))
* **engine:** issue [#989](https://github.com/salesforce/lwc/issues/989) enumerable in shadowRoot ([#998](https://github.com/salesforce/lwc/issues/998)) ([9aab030](https://github.com/salesforce/lwc/commit/9aab030))
* **engine:** issue 990 textContent and innerHTML restrictions ([#1001](https://github.com/salesforce/lwc/issues/1001)) ([514c1f5](https://github.com/salesforce/lwc/commit/514c1f5))
* **engine:** types definition update fixes [#1006](https://github.com/salesforce/lwc/issues/1006) ([#1013](https://github.com/salesforce/lwc/issues/1013)) ([ee0ad9c](https://github.com/salesforce/lwc/commit/ee0ad9c))
* ownerkey lookup of root ele manually injected into another lwc ele ([#1018](https://github.com/salesforce/lwc/issues/1018)) ([82669bb](https://github.com/salesforce/lwc/commit/82669bb))


### Features

* **engine:** remove non-trackable object warning ([#1003](https://github.com/salesforce/lwc/issues/1003)) ([735e8ea](https://github.com/salesforce/lwc/commit/735e8ea))



<a name="0.35.4"></a>
## [0.35.4](https://github.com/salesforce/lwc/compare/v0.35.2...v0.35.4) (2019-01-19)



<a name="0.35.2"></a>
## [0.35.2](https://github.com/salesforce/lwc/compare/v0.35.1...v0.35.2) (2019-01-18)


### Bug Fixes

* **engine:** closes [#958](https://github.com/salesforce/lwc/issues/958) after fixing parentElement ref in slotted node ([#959](https://github.com/salesforce/lwc/issues/959)) ([0ec65ea](https://github.com/salesforce/lwc/commit/0ec65ea)), closes [#967](https://github.com/salesforce/lwc/issues/967)
* **engine:** correct error type from Reference to Type ([#945](https://github.com/salesforce/lwc/issues/945)) ([42fd8d7](https://github.com/salesforce/lwc/commit/42fd8d7))
* **engine:** fixes [#973](https://github.com/salesforce/lwc/issues/973) to support cloneNode with ie11 devtool comment ([#974](https://github.com/salesforce/lwc/issues/974)) ([4931eec](https://github.com/salesforce/lwc/commit/4931eec))
* **engine:** fixes issue [#129](https://github.com/salesforce/lwc/issues/129) - removal of dangerousObjectMutation ([#831](https://github.com/salesforce/lwc/issues/831)) ([b65c1f6](https://github.com/salesforce/lwc/commit/b65c1f6))
* **engine:** implement composedPath, srcElement and path for events ([#859](https://github.com/salesforce/lwc/issues/859)) ([c415ece](https://github.com/salesforce/lwc/commit/c415ece))
* **engine:** to use the later version of observable membrane ([#848](https://github.com/salesforce/lwc/issues/848)) ([9f63a10](https://github.com/salesforce/lwc/commit/9f63a10))
* should always have access to slotted elements ([#939](https://github.com/salesforce/lwc/issues/939)) ([b767131](https://github.com/salesforce/lwc/commit/b767131))


### Features

* **compiler:** improve error message consistency ([#969](https://github.com/salesforce/lwc/issues/969)) ([5c16e22](https://github.com/salesforce/lwc/commit/5c16e22))
* **engine:** improve createElement() second parameter error messages ([#944](https://github.com/salesforce/lwc/issues/944)) ([8dc263b](https://github.com/salesforce/lwc/commit/8dc263b))



<a name="0.35.1"></a>
## [0.35.1](https://github.com/salesforce/lwc/compare/v0.34.0...v0.35.1) (2019-01-11)


### Bug Fixes

* **engine:** regular dom nodes can use object type event listeners ([#943](https://github.com/salesforce/lwc/issues/943)) ([adf3504](https://github.com/salesforce/lwc/commit/adf3504))



<a name="0.34.0"></a>
# [0.34.0](https://github.com/salesforce/lwc/compare/v0.33.28-1...v0.34.0) (2019-01-10)


### Bug Fixes

* **engine:** patching events from lwc to be deterministic ([#870](https://github.com/salesforce/lwc/issues/870)) ([8d3fc9f](https://github.com/salesforce/lwc/commit/8d3fc9f))


### Features

* **compiler:** add bundle entry name + filenames case validation ([#902](https://github.com/salesforce/lwc/issues/902)) ([39b1e00](https://github.com/salesforce/lwc/commit/39b1e00))



<a name="0.33.28-1"></a>
## [0.33.28-1](https://github.com/salesforce/lwc/compare/v0.33.28-alpha3...v0.33.28-1) (2019-01-09)



<a name="0.33.28-alpha3"></a>
## [0.33.28-alpha3](https://github.com/salesforce/lwc/compare/v0.33.26...v0.33.28-alpha3) (2019-01-09)


### Bug Fixes

* **engine:** to show shadow in IE11 devtool DOM explorer ([#904](https://github.com/salesforce/lwc/issues/904)) ([6e2817f](https://github.com/salesforce/lwc/commit/6e2817f))
* **jest-transformer:** update [@salesforce](https://github.com/salesforce)/apex transform ([#924](https://github.com/salesforce/lwc/issues/924)) ([a3d6af5](https://github.com/salesforce/lwc/commit/a3d6af5))
* Add crossorigin as valid img tag attribute ([#918](https://github.com/salesforce/lwc/issues/918)) ([e861600](https://github.com/salesforce/lwc/commit/e861600))


### Features

* **rollup-plugin:** add stylesheetConfig to rollup-plugin options ([#921](https://github.com/salesforce/lwc/issues/921)) ([ca43c83](https://github.com/salesforce/lwc/commit/ca43c83)), closes [#920](https://github.com/salesforce/lwc/issues/920)



<a name="0.33.26"></a>
## [0.33.26](https://github.com/salesforce/lwc/compare/v0.33.25...v0.33.26) (2018-12-21)


### Bug Fixes

* **compiler:** remove misleading and useless stack info on CompilerError ([#893](https://github.com/salesforce/lwc/issues/893)) ([860da4f](https://github.com/salesforce/lwc/commit/860da4f))
* **module-resolver:** wrong path separator in glob call ([#895](https://github.com/salesforce/lwc/issues/895)) ([7f1f954](https://github.com/salesforce/lwc/commit/7f1f954))


### Features

* no production assert tslint rule ([#894](https://github.com/salesforce/lwc/issues/894)) ([1e1aa91](https://github.com/salesforce/lwc/commit/1e1aa91))



<a name="0.33.25"></a>
## [0.33.25](https://github.com/salesforce/lwc/compare/v0.33.24...v0.33.25) (2018-12-14)


### Bug Fixes

* avoid directly extending constructors that are objects in ie11 ([#880](https://github.com/salesforce/lwc/issues/880)) ([04dbd20](https://github.com/salesforce/lwc/commit/04dbd20))



<a name="0.33.24"></a>
## [0.33.24](https://github.com/salesforce/lwc/compare/v0.33.23...v0.33.24) (2018-12-13)



<a name="0.33.23"></a>
## [0.33.23](https://github.com/salesforce/lwc/compare/v0.33.22...v0.33.23) (2018-12-13)



<a name="0.33.22"></a>
## [0.33.22](https://github.com/salesforce/lwc/compare/v0.33.21...v0.33.22) (2018-12-13)



<a name="0.33.21"></a>
## [0.33.21](https://github.com/salesforce/lwc/compare/v0.33.20...v0.33.21) (2018-12-13)



<a name="0.33.20"></a>
## [0.33.20](https://github.com/salesforce/lwc/compare/v0.33.19...v0.33.20) (2018-12-13)



<a name="0.33.19"></a>
## [0.33.19](https://github.com/salesforce/lwc/compare/v0.33.18...v0.33.19) (2018-12-13)



<a name="0.33.18"></a>
## [0.33.18](https://github.com/salesforce/lwc/compare/v0.33.17...v0.33.18) (2018-12-13)


### Bug Fixes

* **engine:** closes [#871](https://github.com/salesforce/lwc/issues/871) - support for svg manual injection ([#872](https://github.com/salesforce/lwc/issues/872)) ([4851400](https://github.com/salesforce/lwc/commit/4851400))
* error when 2 perf markers are stacked ([#865](https://github.com/salesforce/lwc/issues/865)) ([1bce3c7](https://github.com/salesforce/lwc/commit/1bce3c7))
* errors package as hard dep in jest-transformer ([#884](https://github.com/salesforce/lwc/issues/884)) ([9d8717c](https://github.com/salesforce/lwc/commit/9d8717c))



<a name="0.33.17"></a>
## [0.33.17](https://github.com/salesforce/lwc/compare/v0.33.16...v0.33.17) (2018-12-12)


### Bug Fixes

* **engine:** removing lwc:dom error when ownerkey is not defined ([#879](https://github.com/salesforce/lwc/issues/879)) ([b68a72a](https://github.com/salesforce/lwc/commit/b68a72a))



<a name="0.33.16"></a>
## [0.33.16](https://github.com/salesforce/lwc/compare/v0.33.15...v0.33.16) (2018-12-07)



<a name="0.33.15"></a>
## [0.33.15](https://github.com/salesforce/lwc/compare/v0.33.14...v0.33.15) (2018-12-06)


### Bug Fixes

* **compiler:** convert placeholder error codes into real numbers ([#877](https://github.com/salesforce/lwc/issues/877)) ([ae92210](https://github.com/salesforce/lwc/commit/ae92210))



<a name="0.33.14"></a>
## [0.33.14](https://github.com/salesforce/lwc/compare/v0.33.13...v0.33.14) (2018-12-06)


### Features

* secure wrap xlink ([#875](https://github.com/salesforce/lwc/issues/875)) ([fcfbe3f](https://github.com/salesforce/lwc/commit/fcfbe3f))



<a name="0.33.13"></a>
## [0.33.13](https://github.com/salesforce/lwc/compare/v0.33.12...v0.33.13) (2018-12-06)



<a name="0.33.12"></a>
## [0.33.12](https://github.com/salesforce/lwc/compare/v0.33.11...v0.33.12) (2018-12-05)



<a name="0.33.11"></a>
## [0.33.11](https://github.com/salesforce/lwc/compare/v0.33.10...v0.33.11) (2018-12-05)


### Bug Fixes

* **engine:** bunch of broken tests ([#853](https://github.com/salesforce/lwc/issues/853)) ([94e6d2f](https://github.com/salesforce/lwc/commit/94e6d2f))
* hide component to vm mapping from user ([#860](https://github.com/salesforce/lwc/issues/860)) ([5010713](https://github.com/salesforce/lwc/commit/5010713))
* restrict script in MathML and remove srcdoc on iframe ([#867](https://github.com/salesforce/lwc/issues/867)) ([11d906f](https://github.com/salesforce/lwc/commit/11d906f))
* **engine:** deep manual dom elements fix  ([#874](https://github.com/salesforce/lwc/issues/874)) ([041eb1e](https://github.com/salesforce/lwc/commit/041eb1e))



<a name="0.33.10"></a>
## [0.33.10](https://github.com/salesforce/lwc/compare/v0.33.9...v0.33.10) (2018-11-29)


### Bug Fixes

* **compiler:** include start and length with diagnostics ([#856](https://github.com/salesforce/lwc/issues/856)) ([b4fad21](https://github.com/salesforce/lwc/commit/b4fad21))
* minor guard ([#863](https://github.com/salesforce/lwc/issues/863)) ([f439c16](https://github.com/salesforce/lwc/commit/f439c16))
* **engine:** [218] implementation for clone node ([#864](https://github.com/salesforce/lwc/issues/864)) ([0f41231](https://github.com/salesforce/lwc/commit/0f41231))
* **engine:** retargeting elementFromPoint without elementsFromPoint ([#866](https://github.com/salesforce/lwc/issues/866)) ([c665b9a](https://github.com/salesforce/lwc/commit/c665b9a))



<a name="0.33.9"></a>
## [0.33.9](https://github.com/salesforce/lwc/compare/v0.33.8...v0.33.9) (2018-11-26)



<a name="0.33.8"></a>
## [0.33.8](https://github.com/salesforce/lwc/compare/v0.33.7...v0.33.8) (2018-11-26)


### Bug Fixes

* Prevent Javascript injection via ${} in the CSS ([#851](https://github.com/salesforce/lwc/issues/851)) ([6760e2a](https://github.com/salesforce/lwc/commit/6760e2a))
* **engine:** close [#849](https://github.com/salesforce/lwc/issues/849) by implementing move hook ([#852](https://github.com/salesforce/lwc/issues/852)) ([6c05d12](https://github.com/salesforce/lwc/commit/6c05d12))
* **engine:** relatedTarget might not be present ([#857](https://github.com/salesforce/lwc/issues/857)) ([16528a5](https://github.com/salesforce/lwc/commit/16528a5))
* **engine:** retarget to null instead of undefined ([#850](https://github.com/salesforce/lwc/issues/850)) ([058e40c](https://github.com/salesforce/lwc/commit/058e40c))



<a name="0.33.7"></a>
## [0.33.7](https://github.com/salesforce/lwc/compare/v0.33.6...v0.33.7) (2018-11-20)



<a name="0.33.6"></a>
## [0.33.6](https://github.com/salesforce/lwc/compare/v0.33.5...v0.33.6) (2018-11-19)


### Bug Fixes

* css minification ordering issue ([#840](https://github.com/salesforce/lwc/issues/840)) ([2f579f6](https://github.com/salesforce/lwc/commit/2f579f6))
* **engine:** fixes error when switching from tabindex -1 to 0 ([#844](https://github.com/salesforce/lwc/issues/844)) ([a16b399](https://github.com/salesforce/lwc/commit/a16b399))
* **engine:** relatedTarget event regargeting ([#842](https://github.com/salesforce/lwc/issues/842)) ([2906ed8](https://github.com/salesforce/lwc/commit/2906ed8))
* import inline styles ([#843](https://github.com/salesforce/lwc/issues/843)) ([c9d1809](https://github.com/salesforce/lwc/commit/c9d1809))
* remove debugger statament ([#845](https://github.com/salesforce/lwc/issues/845)) ([6c1ce57](https://github.com/salesforce/lwc/commit/6c1ce57))


### Performance Improvements

* upgrade compat ([#847](https://github.com/salesforce/lwc/issues/847)) ([9f1ea77](https://github.com/salesforce/lwc/commit/9f1ea77))



<a name="0.33.5"></a>
## [0.33.5](https://github.com/salesforce/lwc/compare/v0.33.4...v0.33.5) (2018-11-15)



<a name="0.33.4"></a>
## [0.33.4](https://github.com/salesforce/lwc/compare/v0.33.3...v0.33.4) (2018-11-15)



<a name="0.33.3"></a>
## [0.33.3](https://github.com/salesforce/lwc/compare/v0.33.2...v0.33.3) (2018-11-15)


### Bug Fixes

* parse a-trules correctly in CSS ([#839](https://github.com/salesforce/lwc/issues/839)) ([9c1da4d](https://github.com/salesforce/lwc/commit/9c1da4d))


### Features

* **compiler:** collect default value metadata for [@api](https://github.com/api) properties ([#816](https://github.com/salesforce/lwc/issues/816)) ([c64e4b3](https://github.com/salesforce/lwc/commit/c64e4b3))



<a name="0.33.2"></a>
## [0.33.2](https://github.com/salesforce/lwc/compare/v0.33.1...v0.33.2) (2018-11-14)


### Bug Fixes

* return correct target when handler is document/body owned ([#836](https://github.com/salesforce/lwc/issues/836)) ([5203d43](https://github.com/salesforce/lwc/commit/5203d43))
* typescript definitions for lwc and wire roots ([#835](https://github.com/salesforce/lwc/issues/835)) ([3217ce9](https://github.com/salesforce/lwc/commit/3217ce9))
* **engine:** loopholes in our synthetic shadow for local traversing ([#779](https://github.com/salesforce/lwc/issues/779)) ([fc6dc9c](https://github.com/salesforce/lwc/commit/fc6dc9c))


### Features

* **template-compiler:** remove "is" support and add lwc-deprecated:is ([#834](https://github.com/salesforce/lwc/issues/834)) ([f15ad9f](https://github.com/salesforce/lwc/commit/f15ad9f))



<a name="0.33.1"></a>
## [0.33.1](https://github.com/salesforce/lwc/compare/v0.33.0...v0.33.1) (2018-11-13)


### Bug Fixes

* apply implicit logic to jest resolver ([#825](https://github.com/salesforce/lwc/issues/825)) ([c5554fd](https://github.com/salesforce/lwc/commit/c5554fd))
* publicPropsTransform ([#833](https://github.com/salesforce/lwc/issues/833)) ([67008de](https://github.com/salesforce/lwc/commit/67008de))
* serialization ie11 ([#828](https://github.com/salesforce/lwc/issues/828)) ([714c4a8](https://github.com/salesforce/lwc/commit/714c4a8))



<a name="0.33.0"></a>
# [0.33.0](https://github.com/salesforce/lwc/compare/v0.32.1...v0.33.0) (2018-11-13)


### Bug Fixes

* error when document.activeElement is null ([#823](https://github.com/salesforce/lwc/issues/823)) ([5c70269](https://github.com/salesforce/lwc/commit/5c70269))


### Features

* dynamic scoped ids ([#787](https://github.com/salesforce/lwc/issues/787)) ([e1e85cc](https://github.com/salesforce/lwc/commit/e1e85cc))



<a name="0.32.1"></a>
## [0.32.1](https://github.com/salesforce/lwc/compare/v0.31.6...v0.32.1) (2018-11-12)


### Bug Fixes

* remove prod perf markers on wc.ts ([#811](https://github.com/salesforce/lwc/issues/811)) ([074d522](https://github.com/salesforce/lwc/commit/074d522))


### Features

* Allow for implicit/explicit resolution ([#813](https://github.com/salesforce/lwc/issues/813)) ([738956f](https://github.com/salesforce/lwc/commit/738956f))



<a name="0.31.6"></a>
## [0.31.6](https://github.com/salesforce/lwc/compare/v0.31.4...v0.31.6) (2018-11-09)


### Bug Fixes

* **engine:** fix for delegatesFocus with tabindex=0 ([#812](https://github.com/salesforce/lwc/issues/812)) ([81f0dbd](https://github.com/salesforce/lwc/commit/81f0dbd))
* **engine:** fix more ie11 flappers ([#814](https://github.com/salesforce/lwc/issues/814)) ([60f17bc](https://github.com/salesforce/lwc/commit/60f17bc))
* **engine:** loosening restrictions on focus elements ([#790](https://github.com/salesforce/lwc/issues/790)) ([d520c72](https://github.com/salesforce/lwc/commit/d520c72))
* **engine:** marking dynamic nodes as dynamic ([#810](https://github.com/salesforce/lwc/issues/810)) ([958201c](https://github.com/salesforce/lwc/commit/958201c))
* **engine:** remove log when accessing childNodes ([#817](https://github.com/salesforce/lwc/issues/817)) ([9a29102](https://github.com/salesforce/lwc/commit/9a29102))
* **engine:** removing aggressive assert ([#818](https://github.com/salesforce/lwc/issues/818)) ([fdbc119](https://github.com/salesforce/lwc/commit/fdbc119))


### Features

* **compiler:** lwc dom mode directive ([#793](https://github.com/salesforce/lwc/issues/793)) ([e6b27c4](https://github.com/salesforce/lwc/commit/e6b27c4))



<a name="0.31.4"></a>
## [0.31.4](https://github.com/salesforce/lwc/compare/v0.31.3...v0.31.4) (2018-11-07)


### Bug Fixes

* add microtasking to integration tests ([#808](https://github.com/salesforce/lwc/issues/808)) ([7c4b834](https://github.com/salesforce/lwc/commit/7c4b834))



<a name="0.31.3"></a>
## [0.31.3](https://github.com/salesforce/lwc/compare/v0.31.2...v0.31.3) (2018-11-06)


### Bug Fixes

* **engine:** render() can only return qualifying templates ([#764](https://github.com/salesforce/lwc/issues/764)) ([c6556de](https://github.com/salesforce/lwc/commit/c6556de))
* **engine:** was leaking assert lib to prod ([#801](https://github.com/salesforce/lwc/issues/801)) ([d2942fc](https://github.com/salesforce/lwc/commit/d2942fc))
* css newline ([#804](https://github.com/salesforce/lwc/issues/804)) ([c644c3b](https://github.com/salesforce/lwc/commit/c644c3b))
* integration flapper ([#807](https://github.com/salesforce/lwc/issues/807)) ([076385f](https://github.com/salesforce/lwc/commit/076385f))
* test expecting invalid warning ([#805](https://github.com/salesforce/lwc/issues/805)) ([c21f9ff](https://github.com/salesforce/lwc/commit/c21f9ff))


### Features

* **engine:** getRootNode in patched nodes ([#786](https://github.com/salesforce/lwc/issues/786)) ([ede0d7b](https://github.com/salesforce/lwc/commit/ede0d7b))



<a name="0.31.2"></a>
## [0.31.2](https://github.com/salesforce/lwc/compare/v0.31.1...v0.31.2) (2018-11-03)


### Bug Fixes

* remove assert due to safari bug ([#798](https://github.com/salesforce/lwc/issues/798)) ([9381315](https://github.com/salesforce/lwc/commit/9381315))



<a name="0.31.1"></a>
## [0.31.1](https://github.com/salesforce/lwc/compare/v0.30.7...v0.31.1) (2018-11-02)


### Bug Fixes

* **engine:** using tabindex getter in assert ([#785](https://github.com/salesforce/lwc/issues/785)) ([e56b4e2](https://github.com/salesforce/lwc/commit/e56b4e2))
* remove harmful warning that encourages composed events ([#795](https://github.com/salesforce/lwc/issues/795)) ([e5cc47e](https://github.com/salesforce/lwc/commit/e5cc47e))


### Features

* CSS parsing and programatic imports ([#776](https://github.com/salesforce/lwc/issues/776)) ([f739710](https://github.com/salesforce/lwc/commit/f739710))
* **engine:** performance marks ([#756](https://github.com/salesforce/lwc/issues/756)) ([24e029a](https://github.com/salesforce/lwc/commit/24e029a))
* upgrade COMPAT to support splice ([#797](https://github.com/salesforce/lwc/issues/797)) ([1ab7f4a](https://github.com/salesforce/lwc/commit/1ab7f4a))



<a name="0.30.7"></a>
## [0.30.7](https://github.com/salesforce/lwc/compare/v0.30.6...v0.30.7) (2018-10-29)



<a name="0.30.6"></a>
## [0.30.6](https://github.com/salesforce/lwc/compare/v0.30.5...v0.30.6) (2018-10-29)



<a name="0.30.5"></a>
## [0.30.5](https://github.com/salesforce/lwc/compare/v0.30.4...v0.30.5) (2018-10-29)


### Bug Fixes

* **compiler:** resolve error code conflicts ([#770](https://github.com/salesforce/lwc/issues/770)) ([8885eb6](https://github.com/salesforce/lwc/commit/8885eb6))



<a name="0.30.4"></a>
## [0.30.4](https://github.com/salesforce/lwc/compare/v0.30.3...v0.30.4) (2018-10-26)


### Bug Fixes

* **engine:** fixing tab index assert ([#773](https://github.com/salesforce/lwc/issues/773)) ([667b929](https://github.com/salesforce/lwc/commit/667b929))



<a name="0.30.3"></a>
## [0.30.3](https://github.com/salesforce/lwc/compare/v0.30.2...v0.30.3) (2018-10-26)


### Bug Fixes

* **engine:** fix issue [#766](https://github.com/salesforce/lwc/issues/766) to patch query selectors ([#769](https://github.com/salesforce/lwc/issues/769)) ([81093fc](https://github.com/salesforce/lwc/commit/81093fc))
* **engine:** focus delegation fixes to narrow false positives ([#763](https://github.com/salesforce/lwc/issues/763)) ([22e75a5](https://github.com/salesforce/lwc/commit/22e75a5))
* **wire-service:** workaround babel minify issue in compat mode ([#768](https://github.com/salesforce/lwc/issues/768)) ([8e718ae](https://github.com/salesforce/lwc/commit/8e718ae))


### Features

* **jest-transformer:** add transform for [@salesforce](https://github.com/salesforce)/i18n ([#758](https://github.com/salesforce/lwc/issues/758)) ([00a13cc](https://github.com/salesforce/lwc/commit/00a13cc))
* **wire:** use class property default values ([#767](https://github.com/salesforce/lwc/issues/767)) ([4c76b9a](https://github.com/salesforce/lwc/commit/4c76b9a))



<a name="0.30.2"></a>
## [0.30.2](https://github.com/salesforce/lwc/compare/v0.30.1...v0.30.2) (2018-10-24)


### Bug Fixes

* **compiler:** resolves conflicts between locator and errors work ([#759](https://github.com/salesforce/lwc/issues/759)) ([a212efd](https://github.com/salesforce/lwc/commit/a212efd))
* **engine:** error when event listener was on document ([#762](https://github.com/salesforce/lwc/issues/762)) ([6471a65](https://github.com/salesforce/lwc/commit/6471a65))


### Features

* **compiler:** Implement error codes system onto compiler modules ([#726](https://github.com/salesforce/lwc/issues/726)) ([3ee81d5](https://github.com/salesforce/lwc/commit/3ee81d5))
* Add support for locators ([#701](https://github.com/salesforce/lwc/issues/701)) ([464daf4](https://github.com/salesforce/lwc/commit/464daf4))
* **compiler:** throw on any non-whitelisted lwc imports ([#752](https://github.com/salesforce/lwc/issues/752)) ([9652133](https://github.com/salesforce/lwc/commit/9652133))



<a name="0.30.1"></a>
## [0.30.1](https://github.com/salesforce/lwc/compare/v0.30.0...v0.30.1) (2018-10-22)



<a name="0.30.0"></a>
# [0.30.0](https://github.com/salesforce/lwc/compare/v0.29.26-1...v0.30.0) (2018-10-21)


### Features

* **wire:** wire output as wire parameter ([#742](https://github.com/salesforce/lwc/issues/742)) ([33de30e](https://github.com/salesforce/lwc/commit/33de30e))
* next rebased ([#734](https://github.com/salesforce/lwc/issues/734)) ([fb72740](https://github.com/salesforce/lwc/commit/fb72740)), closes [#695](https://github.com/salesforce/lwc/issues/695) [#606](https://github.com/salesforce/lwc/issues/606) [#688](https://github.com/salesforce/lwc/issues/688) [#705](https://github.com/salesforce/lwc/issues/705)



<a name="0.29.26-1"></a>
## [0.29.26-1](https://github.com/salesforce/lwc/compare/v0.29.26...v0.29.26-1) (2018-10-16)


### Features

* **compiler:** collect module exports metadata ([#735](https://github.com/salesforce/lwc/issues/735)) ([3509be5](https://github.com/salesforce/lwc/commit/3509be5))



<a name="0.29.26"></a>
## [0.29.26](https://github.com/salesforce/lwc/compare/v0.29.25...v0.29.26) (2018-10-16)


### Bug Fixes

* retargeting works as expected for innerHTML template modifications ([#739](https://github.com/salesforce/lwc/issues/739)) ([efa6a66](https://github.com/salesforce/lwc/commit/efa6a66))



<a name="0.29.25"></a>
## [0.29.25](https://github.com/salesforce/lwc/compare/v0.29.24...v0.29.25) (2018-10-15)



<a name="0.29.24"></a>
## [0.29.24](https://github.com/salesforce/lwc/compare/v0.29.23...v0.29.24) (2018-10-15)



<a name="0.29.23"></a>
## [0.29.23](https://github.com/salesforce/lwc/compare/v0.29.22...v0.29.23) (2018-10-15)



<a name="0.29.22"></a>
## [0.29.22](https://github.com/salesforce/lwc/compare/v0.29.21...v0.29.22) (2018-10-15)


### Features

* scoped ids ([#714](https://github.com/salesforce/lwc/issues/714)) ([4f48fc7](https://github.com/salesforce/lwc/commit/4f48fc7))



<a name="0.29.21"></a>
## [0.29.21](https://github.com/salesforce/lwc/compare/v0.29.20...v0.29.21) (2018-10-13)



<a name="0.29.20"></a>
## [0.29.20](https://github.com/salesforce/lwc/compare/v0.29.19...v0.29.20) (2018-10-12)


### Bug Fixes

* **compiler:** static tabindex attr can only be 0 or -1 in templates ([#660](https://github.com/salesforce/lwc/issues/660)) ([7a2f3f4](https://github.com/salesforce/lwc/commit/7a2f3f4))



<a name="0.29.19"></a>
## [0.29.19](https://github.com/salesforce/lwc/compare/v0.29.18...v0.29.19) (2018-10-11)


### Bug Fixes

* **docs:** updating restrictions ([#725](https://github.com/salesforce/lwc/issues/725)) ([81e8c2b](https://github.com/salesforce/lwc/commit/81e8c2b))
* better svg whitelisting (from domPurify) ([#728](https://github.com/salesforce/lwc/issues/728)) ([92a1b5e](https://github.com/salesforce/lwc/commit/92a1b5e))


### Features

* remove backwards compatibility support for "engine" ([#721](https://github.com/salesforce/lwc/issues/721)) ([e312f54](https://github.com/salesforce/lwc/commit/e312f54))
* **engine:** inline styles to support native shadow ([#540](https://github.com/salesforce/lwc/issues/540)) ([cecd751](https://github.com/salesforce/lwc/commit/cecd751)), closes [#691](https://github.com/salesforce/lwc/issues/691)



<a name="0.29.18"></a>
## [0.29.18](https://github.com/salesforce/lwc/compare/v0.29.17...v0.29.18) (2018-10-10)



<a name="0.29.17"></a>
## [0.29.17](https://github.com/salesforce/lwc/compare/v0.29.16...v0.29.17) (2018-10-10)


### Bug Fixes

* **engine:** fixes issue [#710](https://github.com/salesforce/lwc/issues/710) - add better error for invalid template ([#718](https://github.com/salesforce/lwc/issues/718)) ([7c6009f](https://github.com/salesforce/lwc/commit/7c6009f)), closes [#693](https://github.com/salesforce/lwc/issues/693)
* **engine:** support multi-level slotting when retargeting and querying ([#712](https://github.com/salesforce/lwc/issues/712)) ([7a22a8b](https://github.com/salesforce/lwc/commit/7a22a8b))


### Features

* **engine:** add API for finding the constructor of a custom element ([#704](https://github.com/salesforce/lwc/issues/704)) ([f08d689](https://github.com/salesforce/lwc/commit/f08d689))



<a name="0.29.16"></a>
## [0.29.16](https://github.com/salesforce/lwc/compare/v0.29.14...v0.29.16) (2018-10-07)


### Bug Fixes

* **engine:** integration flapper - async-event-target ([#715](https://github.com/salesforce/lwc/issues/715)) ([6a7de86](https://github.com/salesforce/lwc/commit/6a7de86))



<a name="0.29.14"></a>
## [0.29.14](https://github.com/salesforce/lwc/compare/v0.29.13...v0.29.14) (2018-10-05)


### Bug Fixes

* **engine:** fix traversal for error boundaries in native shadow DOM ([#686](https://github.com/salesforce/lwc/issues/686)) ([b4b29a1](https://github.com/salesforce/lwc/commit/b4b29a1))


### Features

* **compiler:** add sourcemap to options and result ([#696](https://github.com/salesforce/lwc/issues/696)) ([2a3ce0f](https://github.com/salesforce/lwc/commit/2a3ce0f))
* introduce secure API for template verification ([#693](https://github.com/salesforce/lwc/issues/693)) ([3b4a63e](https://github.com/salesforce/lwc/commit/3b4a63e))
* **jest-transformer:** generate jest tests sourcemaps ([#706](https://github.com/salesforce/lwc/issues/706)) ([2b3b28d](https://github.com/salesforce/lwc/commit/2b3b28d))
* **parse5:** update parse5, usage, tests ([#707](https://github.com/salesforce/lwc/issues/707)) ([64206dc](https://github.com/salesforce/lwc/commit/64206dc))



<a name="0.29.13"></a>
## [0.29.13](https://github.com/salesforce/lwc/compare/v0.29.12...v0.29.13) (2018-10-03)


### Features

* expose *internal* APIs ([#703](https://github.com/salesforce/lwc/issues/703)) ([b787190](https://github.com/salesforce/lwc/commit/b787190))


### Performance Improvements

* point to our own instance of best ([#700](https://github.com/salesforce/lwc/issues/700)) ([91bc49b](https://github.com/salesforce/lwc/commit/91bc49b))



<a name="0.29.12"></a>
## [0.29.12](https://github.com/salesforce/lwc/compare/v0.29.11-1...v0.29.12) (2018-10-03)



<a name="0.29.11-1"></a>
## [0.29.11-1](https://github.com/salesforce/lwc/compare/v0.29.11...v0.29.11-1) (2018-10-02)


### Bug Fixes

* Remove `NODE_ENV` default value ([#687](https://github.com/salesforce/lwc/issues/687)) ([6d81d7a](https://github.com/salesforce/lwc/commit/6d81d7a))


### Features

* bundle metadata to include modules used and their props @W-5395396 ([#672](https://github.com/salesforce/lwc/issues/672)) ([039a2af](https://github.com/salesforce/lwc/commit/039a2af))


### Performance Improvements

* disable Best on IE11 ([#698](https://github.com/salesforce/lwc/issues/698)) ([bba0480](https://github.com/salesforce/lwc/commit/bba0480))



<a name="0.29.11"></a>
## [0.29.11](https://github.com/salesforce/lwc/compare/v0.29.10...v0.29.11) (2018-10-02)


### Features

* **engine:** adding basic support for slotchange event ([#635](https://github.com/salesforce/lwc/issues/635)) ([ee0d7f3](https://github.com/salesforce/lwc/commit/ee0d7f3))



<a name="0.29.10"></a>
## [0.29.10](https://github.com/salesforce/lwc/compare/v0.29.9...v0.29.10) (2018-10-02)


### Features

* **compiler:** detect unimported decorators ([#681](https://github.com/salesforce/lwc/issues/681)) ([4788b26](https://github.com/salesforce/lwc/commit/4788b26))
* **svg:** validate allowed svg tags ([#694](https://github.com/salesforce/lwc/issues/694)) ([ae82aa7](https://github.com/salesforce/lwc/commit/ae82aa7))



<a name="0.29.9"></a>
## [0.29.9](https://github.com/salesforce/lwc/compare/v0.29.8...v0.29.9) (2018-09-29)


### Bug Fixes

* **engine:** identify LWC console logs ([#674](https://github.com/salesforce/lwc/issues/674)) ([816b643](https://github.com/salesforce/lwc/commit/816b643))
* **jest-transformer:** update tests to reflect namespace syntax ([#685](https://github.com/salesforce/lwc/issues/685)) ([648922f](https://github.com/salesforce/lwc/commit/648922f))
* zindex optimization in prod ([#690](https://github.com/salesforce/lwc/issues/690)) ([88f3dcd](https://github.com/salesforce/lwc/commit/88f3dcd)), closes [#689](https://github.com/salesforce/lwc/issues/689)


### Features

* **jest-transformer:** add transform for [@salesforce](https://github.com/salesforce)/contentAssetUrl ([#684](https://github.com/salesforce/lwc/issues/684)) ([b711b32](https://github.com/salesforce/lwc/commit/b711b32))



<a name="0.29.8"></a>
## [0.29.8](https://github.com/salesforce/lwc/compare/v0.29.7...v0.29.8) (2018-09-27)


### Bug Fixes

* upgrade compat ([#683](https://github.com/salesforce/lwc/issues/683)) ([eaab65c](https://github.com/salesforce/lwc/commit/eaab65c))



<a name="0.29.7"></a>
## [0.29.7](https://github.com/salesforce/lwc/compare/v0.29.7-pre01...v0.29.7) (2018-09-27)


### Bug Fixes

* **engine:** bail retargeting if target is detached ([#679](https://github.com/salesforce/lwc/issues/679)) ([faf9cd4](https://github.com/salesforce/lwc/commit/faf9cd4))



<a name="0.29.7-pre01"></a>
## [0.29.7-pre01](https://github.com/salesforce/lwc/compare/v0.29.1...v0.29.7-pre01) (2018-09-26)


### Bug Fixes

* **engine:** fixes [#663](https://github.com/salesforce/lwc/issues/663) - unique keys for sloted elements ([#664](https://github.com/salesforce/lwc/issues/664)) ([00529a9](https://github.com/salesforce/lwc/commit/00529a9))
* **engine:** fixes issue [#658](https://github.com/salesforce/lwc/issues/658) - parentNode on slotted elements ([#661](https://github.com/salesforce/lwc/issues/661)) ([d22bdd8](https://github.com/salesforce/lwc/commit/d22bdd8))
* remove ignoring files ([#673](https://github.com/salesforce/lwc/issues/673)) ([c5d3e80](https://github.com/salesforce/lwc/commit/c5d3e80))
* remove release artifacts ([#649](https://github.com/salesforce/lwc/issues/649)) ([a528117](https://github.com/salesforce/lwc/commit/a528117))
* revert namespace mapping support ([#662](https://github.com/salesforce/lwc/issues/662)) ([728b557](https://github.com/salesforce/lwc/commit/728b557))
* simplify rollup package ([#659](https://github.com/salesforce/lwc/issues/659)) ([e59f0f6](https://github.com/salesforce/lwc/commit/e59f0f6))
* upgrade lwc rollup to support compat ([#646](https://github.com/salesforce/lwc/issues/646)) ([d1d3fa5](https://github.com/salesforce/lwc/commit/d1d3fa5))
* upgrading babel ([#653](https://github.com/salesforce/lwc/issues/653)) ([ee1e513](https://github.com/salesforce/lwc/commit/ee1e513))


### Features

* augments metadata gathering for [@wire](https://github.com/wire) decorator ([#631](https://github.com/salesforce/lwc/issues/631)) ([4920a4e](https://github.com/salesforce/lwc/commit/4920a4e))
* **compiler:** warnings to change dynamic ids to static ids ([#620](https://github.com/salesforce/lwc/issues/620)) ([a32289a](https://github.com/salesforce/lwc/commit/a32289a))
* better error message when event listener is missing ([#656](https://github.com/salesforce/lwc/issues/656)) ([e77f7a7](https://github.com/salesforce/lwc/commit/e77f7a7))
* **postcss-plugin-lwc:** make CSS transform compatible with shadow DOM ([#637](https://github.com/salesforce/lwc/issues/637)) ([69ece4b](https://github.com/salesforce/lwc/commit/69ece4b))


### Performance Improvements

* added ie11 agent and benchmark config ([#654](https://github.com/salesforce/lwc/issues/654)) ([2b1dac4](https://github.com/salesforce/lwc/commit/2b1dac4))
* upgrade agent: chrome 70 ([#648](https://github.com/salesforce/lwc/issues/648)) ([39e71c8](https://github.com/salesforce/lwc/commit/39e71c8))
* upgrade best ([#647](https://github.com/salesforce/lwc/issues/647)) ([4f6f1c1](https://github.com/salesforce/lwc/commit/4f6f1c1))
* upgrade best ([#677](https://github.com/salesforce/lwc/issues/677)) ([633a000](https://github.com/salesforce/lwc/commit/633a000))



<a name="0.29.1"></a>
## [0.29.1](https://github.com/salesforce/lwc/compare/v0.29.0...v0.29.1) (2018-09-13)



<a name="0.29.0"></a>
# [0.29.0](https://github.com/salesforce/lwc/compare/v0.28.2...v0.29.0) (2018-09-13)


### Bug Fixes

* rename [@salesforce](https://github.com/salesforce)/resource-url to [@salesforce](https://github.com/salesforce)/resourceUrl ([#638](https://github.com/salesforce/lwc/issues/638)) ([2a86c4d](https://github.com/salesforce/lwc/commit/2a86c4d))


### Features

* open usage of data-* and aria-* attributes in CSS ([#632](https://github.com/salesforce/lwc/issues/632)) ([9e269bf](https://github.com/salesforce/lwc/commit/9e269bf)), closes [#623](https://github.com/salesforce/lwc/issues/623)
* remove usage of :host-context ([#629](https://github.com/salesforce/lwc/issues/629)) ([5634840](https://github.com/salesforce/lwc/commit/5634840))



<a name="0.28.2"></a>
## [0.28.2](https://github.com/salesforce/lwc/compare/v0.28.0-rc1...v0.28.2) (2018-09-09)


### Bug Fixes

* renaming for namespaces ([#627](https://github.com/salesforce/lwc/issues/627)) ([6e9b75c](https://github.com/salesforce/lwc/commit/6e9b75c))



<a name="0.28.0-rc1"></a>
# [0.28.0-rc1](https://github.com/salesforce/lwc/compare/v0.27.1...v0.28.0-rc1) (2018-09-08)



<a name="0.27.1"></a>
## [0.27.1](https://github.com/salesforce/lwc/compare/v0.27.0...v0.27.1) (2018-09-05)


### Bug Fixes

* **engine:** asserts logs require elm to print component stack ([#573](https://github.com/salesforce/lwc/issues/573)) ([387fd05](https://github.com/salesforce/lwc/commit/387fd05)), closes [#563](https://github.com/salesforce/lwc/issues/563)


### Features

* **babel-plugin-transform-lwc-class:** add component tag name support ([#621](https://github.com/salesforce/lwc/issues/621)) ([57cae0c](https://github.com/salesforce/lwc/commit/57cae0c))
* **compiler:** add namespace support for js/html transform ([#611](https://github.com/salesforce/lwc/issues/611)) ([d5ced31](https://github.com/salesforce/lwc/commit/d5ced31))
* **engine:** adding this.template.activeElement into faux-shadow ([#612](https://github.com/salesforce/lwc/issues/612)) ([90d18ef](https://github.com/salesforce/lwc/commit/90d18ef))


### Performance Improvements

* **engine:** trying to get best back on track ([#616](https://github.com/salesforce/lwc/issues/616)) ([6e78171](https://github.com/salesforce/lwc/commit/6e78171))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/salesforce/lwc/compare/v0.26.0...v0.27.0) (2018-08-25)


### Bug Fixes

* **engine:** undefined initial values should be respected ([#558](https://github.com/salesforce/lwc/issues/558)) ([e2f24b8](https://github.com/salesforce/lwc/commit/e2f24b8)), closes [#490](https://github.com/salesforce/lwc/issues/490)



<a name="0.26.0"></a>
# [0.26.0](https://github.com/salesforce/lwc/compare/v0.25.5...v0.26.0) (2018-08-24)


### Bug Fixes

* disable dual [@api](https://github.com/api) decorators support  @W-5165180 ([#598](https://github.com/salesforce/lwc/issues/598)) ([ce9308b](https://github.com/salesforce/lwc/commit/ce9308b))
* **engine:** closes [#515](https://github.com/salesforce/lwc/issues/515) by removing lazy init ([#517](https://github.com/salesforce/lwc/issues/517)) ([38fe207](https://github.com/salesforce/lwc/commit/38fe207))
* remove comments in minified bundle @W-5320429 ([#599](https://github.com/salesforce/lwc/issues/599)) ([46d65c0](https://github.com/salesforce/lwc/commit/46d65c0))
* update package version when releasing ([#595](https://github.com/salesforce/lwc/issues/595)) ([ea0434d](https://github.com/salesforce/lwc/commit/ea0434d))
* update wire pkg and playground ([#604](https://github.com/salesforce/lwc/issues/604)) ([ccc92ed](https://github.com/salesforce/lwc/commit/ccc92ed))
* validate directive-less template tag ([#589](https://github.com/salesforce/lwc/issues/589)) ([7739e64](https://github.com/salesforce/lwc/commit/7739e64))
* **engine:** invert condition to apply click-event-composed polyfill ([#590](https://github.com/salesforce/lwc/issues/590)) ([#591](https://github.com/salesforce/lwc/issues/591)) ([cb7c43a](https://github.com/salesforce/lwc/commit/cb7c43a))



<a name="0.25.5"></a>
## [0.25.5](https://github.com/salesforce/lwc/compare/v0.25.5-alpha...v0.25.5) (2018-08-15)


### Bug Fixes

* **build:** update version before building dist files to publish ([#585](https://github.com/salesforce/lwc/issues/585)) ([bd5da03](https://github.com/salesforce/lwc/commit/bd5da03))
* disable verify when using auth token ([#587](https://github.com/salesforce/lwc/issues/587)) ([2a3ec2a](https://github.com/salesforce/lwc/commit/2a3ec2a))
* remove npm client configuration ([10ef9be](https://github.com/salesforce/lwc/commit/10ef9be))



<a name="0.25.5-alpha"></a>
## [0.25.5-alpha](https://github.com/salesforce/lwc/compare/v0.25.4...v0.25.5-alpha) (2018-08-14)


### Bug Fixes

* **engine:** support stopPropagation on the tpl ([#571](https://github.com/salesforce/lwc/issues/571)) ([7e729c8](https://github.com/salesforce/lwc/commit/7e729c8)), closes [#566](https://github.com/salesforce/lwc/issues/566)


### Features

* **engine:** polyfill for non-composed click events ([#568](https://github.com/salesforce/lwc/issues/568)) ([d15b77b](https://github.com/salesforce/lwc/commit/d15b77b))



<a name="0.25.4"></a>
## [0.25.4](https://github.com/salesforce/lwc/compare/v0.25.3...v0.25.4) (2018-08-12)


### Bug Fixes

* make [@api](https://github.com/api) decorator spec compliant ([#572](https://github.com/salesforce/lwc/issues/572)) ([deeb6bb](https://github.com/salesforce/lwc/commit/deeb6bb))



<a name="0.25.3"></a>
## [0.25.3](https://github.com/salesforce/lwc/compare/v0.25.3-alpha11...v0.25.3) (2018-08-11)



<a name="0.25.3-alpha11"></a>
## [0.25.3-alpha11](https://github.com/salesforce/lwc/compare/v0.25.3-alpha10...v0.25.3-alpha11) (2018-08-11)



<a name="0.25.3-alpha07"></a>
## [0.25.3-alpha07](https://github.com/salesforce/lwc/compare/v0.25.3-alpha06...v0.25.3-alpha07) (2018-08-10)



<a name="0.25.2"></a>
## [0.25.2](https://github.com/salesforce/lwc/compare/v0.25.2-alpha01...v0.25.2) (2018-08-10)



<a name="0.25.2-alpha01"></a>
## [0.25.2-alpha01](https://github.com/salesforce/lwc/compare/v0.24.20...v0.25.2-alpha01) (2018-08-09)


### Bug Fixes

* allow test resolver to resolve lwc ([#565](https://github.com/salesforce/lwc/issues/565)) ([1f6653d](https://github.com/salesforce/lwc/commit/1f6653d))
* renaming engine and named imports ([#567](https://github.com/salesforce/lwc/issues/567)) ([c0da00d](https://github.com/salesforce/lwc/commit/c0da00d))



<a name="0.24.20"></a>
## [0.24.20](https://github.com/salesforce/lwc/compare/v0.24.19-alpha03...v0.24.20) (2018-08-07)



<a name="0.24.19-alpha03"></a>
## [0.24.19-alpha03](https://github.com/salesforce/lwc/compare/v0.24.19-alpha02...v0.24.19-alpha03) (2018-08-06)



<a name="0.24.17"></a>
## [0.24.17](https://github.com/salesforce/lwc/compare/v0.24.17-alpha02...v0.24.17) (2018-08-06)



<a name="0.24.17-alpha02"></a>
## [0.24.17-alpha02](https://github.com/salesforce/lwc/compare/v0.24.17-alpha01...v0.24.17-alpha02) (2018-08-06)


### Bug Fixes

* upgrade compat dependencies (add setPrototypeOf) ([#559](https://github.com/salesforce/lwc/issues/559)) ([b982bd8](https://github.com/salesforce/lwc/commit/b982bd8))


### Features

* allow both "lwc" and "engine" sources ([#560](https://github.com/salesforce/lwc/issues/560)) ([501586c](https://github.com/salesforce/lwc/commit/501586c))



<a name="0.24.16"></a>
## [0.24.16](https://github.com/salesforce/lwc/compare/v0.25.1-alpha24...v0.24.16) (2018-08-02)



<a name="0.25.1-alpha24"></a>
## [0.25.1-alpha24](https://github.com/salesforce/lwc/compare/v0.25.1-alpha22...v0.25.1-alpha24) (2018-08-02)



<a name="0.25.1-alpha19"></a>
## [0.25.1-alpha19](https://github.com/salesforce/lwc/compare/v0.24.14...v0.25.1-alpha19) (2018-08-01)


### Bug Fixes

* **compiler:** correct module-resolver error messages [@bug](https://github.com/bug) W-5192589@ ([#551](https://github.com/salesforce/lwc/issues/551)) ([d1e93cc](https://github.com/salesforce/lwc/commit/d1e93cc))



<a name="0.25.1-alpha18"></a>
## [0.25.1-alpha18](https://github.com/salesforce/lwc/compare/v0.25.1-alpha17...v0.25.1-alpha18) (2018-08-01)


### Bug Fixes

* **engine:** never access props from proxies ([#546](https://github.com/salesforce/lwc/issues/546)) ([d0cf318](https://github.com/salesforce/lwc/commit/d0cf318))
* **lwc-compiler:** invalid CSS generation when minified is enabled ([#552](https://github.com/salesforce/lwc/issues/552)) ([f19ebb1](https://github.com/salesforce/lwc/commit/f19ebb1))



<a name="0.25.1-alpha17"></a>
## [0.25.1-alpha17](https://github.com/salesforce/lwc/compare/v0.25.1-alpha16...v0.25.1-alpha17) (2018-07-31)



<a name="0.25.1-alpha16"></a>
## [0.25.1-alpha16](https://github.com/salesforce/lwc/compare/v0.25.1-alpha15...v0.25.1-alpha16) (2018-07-31)


### Bug Fixes

* update babel-minify to fix minification issue ([#545](https://github.com/salesforce/lwc/issues/545)) ([3c68a69](https://github.com/salesforce/lwc/commit/3c68a69))



<a name="0.25.1-alpha15"></a>
## [0.25.1-alpha15](https://github.com/salesforce/lwc/compare/v0.25.1-alpha14...v0.25.1-alpha15) (2018-07-31)



<a name="0.25.1-alpha14"></a>
## [0.25.1-alpha14](https://github.com/salesforce/lwc/compare/v0.25.1-alpha13...v0.25.1-alpha14) (2018-07-31)



<a name="0.25.1-alpha11"></a>
## [0.25.1-alpha11](https://github.com/salesforce/lwc/compare/v0.25.1-alpha10...v0.25.1-alpha11) (2018-07-30)


### Bug Fixes

* **engine:** wrapping assert for dev-only ([#544](https://github.com/salesforce/lwc/issues/544)) ([751904b](https://github.com/salesforce/lwc/commit/751904b))



<a name="0.25.1-alpha06"></a>
## [0.25.1-alpha06](https://github.com/salesforce/lwc/compare/v0.25.1-alpha05...v0.25.1-alpha06) (2018-07-27)


### Bug Fixes

* **engine:** closes issue [#538](https://github.com/salesforce/lwc/issues/538) to support remove listener during invoke  ([#541](https://github.com/salesforce/lwc/issues/541)) ([19121d1](https://github.com/salesforce/lwc/commit/19121d1))



<a name="0.24.13-alpha01"></a>
## [0.24.13-alpha01](https://github.com/salesforce/lwc/compare/v0.24.12-alpha06...v0.24.13-alpha01) (2018-07-26)


### Bug Fixes

* **ci:** run prepare before release ([#531](https://github.com/salesforce/lwc/issues/531)) ([c2379c7](https://github.com/salesforce/lwc/commit/c2379c7))
* **engine:** closes [#524](https://github.com/salesforce/lwc/issues/524) relax attribute mutation assertion ([#525](https://github.com/salesforce/lwc/issues/525)) ([0fad9ab](https://github.com/salesforce/lwc/commit/0fad9ab))
* **engine:** refactor condition to apply event-composed polyfill ([#534](https://github.com/salesforce/lwc/issues/534)) ([84fbfd0](https://github.com/salesforce/lwc/commit/84fbfd0))
* Escape backtick and backslash in CSS ([#536](https://github.com/salesforce/lwc/issues/536)) ([237d88b](https://github.com/salesforce/lwc/commit/237d88b)), closes [#530](https://github.com/salesforce/lwc/issues/530)


### Features

* **lwc-template-compiler:** Add new compiler API compileToFunction ([#528](https://github.com/salesforce/lwc/issues/528)) ([9cd6952](https://github.com/salesforce/lwc/commit/9cd6952))



<a name="0.24.2"></a>
## [0.24.2](https://github.com/salesforce/lwc/compare/v0.24.1...v0.24.2) (2018-07-18)



<a name="0.24.1"></a>
## [0.24.1](https://github.com/salesforce/lwc/compare/v0.23.2...v0.24.1) (2018-07-13)


### Bug Fixes

* **engine:** [214] no longer sharing shadow targets ([#443](https://github.com/salesforce/lwc/issues/443)) ([#446](https://github.com/salesforce/lwc/issues/446)) ([119df9c](https://github.com/salesforce/lwc/commit/119df9c))
* **engine:** bug introduced that breaks circular on proto chain ([#505](https://github.com/salesforce/lwc/issues/505)) ([b8287f1](https://github.com/salesforce/lwc/commit/b8287f1))
* **engine:** closes [#486](https://github.com/salesforce/lwc/issues/486) to lowercase tag names ([#494](https://github.com/salesforce/lwc/issues/494)) ([704422f](https://github.com/salesforce/lwc/commit/704422f))
* **engine:** closes issue [#225](https://github.com/salesforce/lwc/issues/225) - value and checked props are live ([#471](https://github.com/salesforce/lwc/issues/471)) ([473a1b3](https://github.com/salesforce/lwc/commit/473a1b3))
* **engine:** composed event whitelist ([#462](https://github.com/salesforce/lwc/issues/462)) ([3b57eb7](https://github.com/salesforce/lwc/commit/3b57eb7))
* **engine:** engine code should never go thru a proxy obj ([#424](https://github.com/salesforce/lwc/issues/424)) ([50fbc52](https://github.com/salesforce/lwc/commit/50fbc52))
* **engine:** forcing composed: true for focusout events ([#465](https://github.com/salesforce/lwc/issues/465)) ([3c0a6cb](https://github.com/salesforce/lwc/commit/3c0a6cb))
* **engine:** handling AOM properties on anchor tags ([#488](https://github.com/salesforce/lwc/issues/488)) ([575f881](https://github.com/salesforce/lwc/commit/575f881))
* **engine:** handling event target in window listeners ([#499](https://github.com/salesforce/lwc/issues/499)) ([0ff8ff2](https://github.com/salesforce/lwc/commit/0ff8ff2))
* **engine:** incorrect key for the owner when retargeting ([#472](https://github.com/salesforce/lwc/issues/472)) ([539386a](https://github.com/salesforce/lwc/commit/539386a))
* **engine:** issue [#180](https://github.com/salesforce/lwc/issues/180) - getAttribute for data-foo ([#468](https://github.com/salesforce/lwc/issues/468)) ([fcbbd0d](https://github.com/salesforce/lwc/commit/fcbbd0d))
* **engine:** opt-out of initial undef prop value in diff ([#490](https://github.com/salesforce/lwc/issues/490)) ([17133c6](https://github.com/salesforce/lwc/commit/17133c6))
* **engine:** removing "is" in benchmarks ([#451](https://github.com/salesforce/lwc/issues/451)) ([b86af35](https://github.com/salesforce/lwc/commit/b86af35))
* **engine:** support locker to manually create elements ([#508](https://github.com/salesforce/lwc/issues/508)) ([87b86e5](https://github.com/salesforce/lwc/commit/87b86e5))
* **engine:** validate slot names on every rendering ([#470](https://github.com/salesforce/lwc/issues/470)) ([df6e612](https://github.com/salesforce/lwc/commit/df6e612))
* **lwc-template-compiler:** iteration in SVG element ([#460](https://github.com/salesforce/lwc/issues/460)) ([ff91f08](https://github.com/salesforce/lwc/commit/ff91f08))
* **test-utils:** convert to cjs module ([#431](https://github.com/salesforce/lwc/issues/431)) ([3e65275](https://github.com/salesforce/lwc/commit/3e65275))
* **wire-service:** error with invalid adapter id ([#475](https://github.com/salesforce/lwc/issues/475)) ([bb0a064](https://github.com/salesforce/lwc/commit/bb0a064))
* **wire-service:** support optional config object on [@wire](https://github.com/wire) ([#473](https://github.com/salesforce/lwc/issues/473)) ([34f0d85](https://github.com/salesforce/lwc/commit/34f0d85)), closes [#181](https://github.com/salesforce/lwc/issues/181) [#149](https://github.com/salesforce/lwc/issues/149)
* add missing npm dependency. Allow dynamic imports ([#461](https://github.com/salesforce/lwc/issues/461)) ([651494c](https://github.com/salesforce/lwc/commit/651494c))


### Features

* CSS variable injection ([#426](https://github.com/salesforce/lwc/issues/426)) ([c8d0f9c](https://github.com/salesforce/lwc/commit/c8d0f9c))
* **compiler:** checked transformation errors ([#496](https://github.com/salesforce/lwc/issues/496)) ([d2f6e63](https://github.com/salesforce/lwc/commit/d2f6e63))
* **compiler:** do not enforce getter/setter pairs for api decorators ([#474](https://github.com/salesforce/lwc/issues/474)) ([b662c5d](https://github.com/salesforce/lwc/commit/b662c5d))
* **engine:** api to build custom elements ([#87](https://github.com/salesforce/lwc/issues/87)) ([614e8dd](https://github.com/salesforce/lwc/commit/614e8dd))
* **engine:** Implements slot assigned nodes/elements ([#442](https://github.com/salesforce/lwc/issues/442)) ([8b26852](https://github.com/salesforce/lwc/commit/8b26852))
* **jest-transformer:** Add babel transform for new scoped imports  ([#463](https://github.com/salesforce/lwc/issues/463)) ([4893505](https://github.com/salesforce/lwc/commit/4893505))



<a name="0.23.2"></a>
## [0.23.2](https://github.com/salesforce/lwc/compare/v0.23.1...v0.23.2) (2018-06-14)


### Bug Fixes

* **engine:** adding integration tests for async events ([#411](https://github.com/salesforce/lwc/issues/411)) ([4e2e222](https://github.com/salesforce/lwc/commit/4e2e222))


### Features

* **test-utils:** add lwc-test-utils with templateQuerySelector API ([#414](https://github.com/salesforce/lwc/issues/414)) ([c07376c](https://github.com/salesforce/lwc/commit/c07376c))



<a name="0.23.1"></a>
## [0.23.1](https://github.com/salesforce/lwc/compare/v0.23.0...v0.23.1) (2018-06-13)


### Bug Fixes

* **engine:** never use a dot notation of patched objects ([#410](https://github.com/salesforce/lwc/issues/410)) ([2c6b1f4](https://github.com/salesforce/lwc/commit/2c6b1f4))
* **jest-preset:** remove trailing comma from json ([#409](https://github.com/salesforce/lwc/issues/409)) ([369e073](https://github.com/salesforce/lwc/commit/369e073))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/salesforce/lwc/compare/v0.22.8...v0.23.0) (2018-06-13)


### Bug Fixes

* simplify style logic in template compiler ([#314](https://github.com/salesforce/lwc/issues/314)) ([598d940](https://github.com/salesforce/lwc/commit/598d940))
* Use token for the styling host element instead of tag name ([#390](https://github.com/salesforce/lwc/issues/390)) ([cccc63d](https://github.com/salesforce/lwc/commit/cccc63d)), closes [#383](https://github.com/salesforce/lwc/issues/383)
* **engine:** adding more tests for proxies ([#407](https://github.com/salesforce/lwc/issues/407)) ([7c2ae0a](https://github.com/salesforce/lwc/commit/7c2ae0a))
* **engine:** allowing global listeners ([#404](https://github.com/salesforce/lwc/issues/404)) ([da2d3c7](https://github.com/salesforce/lwc/commit/da2d3c7))


### Features

* Add customProperties config to postcss-lwc-plugin ([#349](https://github.com/salesforce/lwc/issues/349)) ([231e00d](https://github.com/salesforce/lwc/commit/231e00d))



<a name="0.22.8"></a>
## [0.22.8](https://github.com/salesforce/lwc/compare/v0.22.7...v0.22.8) (2018-06-12)



<a name="0.22.7"></a>
## [0.22.7](https://github.com/salesforce/lwc/compare/v0.22.6...v0.22.7) (2018-06-10)



<a name="0.22.6"></a>
## [0.22.6](https://github.com/salesforce/lwc/compare/v0.22.5...v0.22.6) (2018-06-08)


### Bug Fixes

* **compiler:** displaying correct ambigious attribute name ([#377](https://github.com/salesforce/lwc/issues/377)) ([4c0720a](https://github.com/salesforce/lwc/commit/4c0720a))
* **engine:** Adding warning on native shadow childNodes ([#382](https://github.com/salesforce/lwc/issues/382)) ([156b03d](https://github.com/salesforce/lwc/commit/156b03d))
* **engine:** handling dispatching events inside of root event handlers ([#391](https://github.com/salesforce/lwc/issues/391)) ([02b9402](https://github.com/salesforce/lwc/commit/02b9402))
* **engine:** including text nodes to childNodes ([#389](https://github.com/salesforce/lwc/issues/389)) ([9cbd853](https://github.com/salesforce/lwc/commit/9cbd853))
* **engine:** remove non-track state warning ([#376](https://github.com/salesforce/lwc/issues/376)) ([485357e](https://github.com/salesforce/lwc/commit/485357e))
* **engine:** shadow root childNodes ([#374](https://github.com/salesforce/lwc/issues/374)) ([a4c21a0](https://github.com/salesforce/lwc/commit/a4c21a0))


### Features

* **compiler:** support default import identifier for wire decorator ([#378](https://github.com/salesforce/lwc/issues/378)) ([905dd78](https://github.com/salesforce/lwc/commit/905dd78))
* **engine:** slot assignedSlot property ([#381](https://github.com/salesforce/lwc/issues/381)) ([6a36afc](https://github.com/salesforce/lwc/commit/6a36afc))
* **lwc-compiler:** add baseDir support ([#375](https://github.com/salesforce/lwc/issues/375)) ([d1cf4a7](https://github.com/salesforce/lwc/commit/d1cf4a7))



<a name="0.22.5"></a>
## [0.22.5](https://github.com/salesforce/lwc/compare/v0.22.4...v0.22.5) (2018-06-03)


### Bug Fixes

* disable shadow and membrane in prod ([#372](https://github.com/salesforce/lwc/issues/372)) ([41149c2](https://github.com/salesforce/lwc/commit/41149c2))



<a name="0.22.4"></a>
## [0.22.4](https://github.com/salesforce/lwc/compare/v0.22.3...v0.22.4) (2018-06-03)


### Bug Fixes

* removing shadowRoot property from elements ([#371](https://github.com/salesforce/lwc/issues/371)) ([fb1e968](https://github.com/salesforce/lwc/commit/fb1e968))



<a name="0.22.3"></a>
## [0.22.3](https://github.com/salesforce/lwc/compare/v0.22.2...v0.22.3) (2018-06-02)



<a name="0.22.2"></a>
## [0.22.2](https://github.com/salesforce/lwc/compare/v0.22.1...v0.22.2) (2018-06-02)


### Bug Fixes

* **engine:** expose shadowRoot if the mode is open ([#367](https://github.com/salesforce/lwc/issues/367)) ([3de5ec3](https://github.com/salesforce/lwc/commit/3de5ec3))
* **engine:** fixing slotted event targets ([#368](https://github.com/salesforce/lwc/issues/368)) ([def3b83](https://github.com/salesforce/lwc/commit/def3b83))



<a name="0.22.1"></a>
## [0.22.1](https://github.com/salesforce/lwc/compare/v0.22.0...v0.22.1) (2018-05-31)


### Bug Fixes

* **engine:** fixed [#342](https://github.com/salesforce/lwc/issues/342) - clean up and docs ([#358](https://github.com/salesforce/lwc/issues/358)) ([01c7eb8](https://github.com/salesforce/lwc/commit/01c7eb8))
* **engine:** fixing event target from slotted element ([#359](https://github.com/salesforce/lwc/issues/359)) ([594e508](https://github.com/salesforce/lwc/commit/594e508))
* **engine:** going through cmpRoot to get default aria value ([#360](https://github.com/salesforce/lwc/issues/360)) ([6322456](https://github.com/salesforce/lwc/commit/6322456))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/salesforce/lwc/compare/v0.21.0...v0.22.0) (2018-05-31)


### Bug Fixes

* **engine:** removing iframe content window unwrapping ([#356](https://github.com/salesforce/lwc/issues/356)) ([14f8e8b](https://github.com/salesforce/lwc/commit/14f8e8b))


### Features

* **compiler:** removed compiler slotset ([#348](https://github.com/salesforce/lwc/issues/348)) ([cab0f5b](https://github.com/salesforce/lwc/commit/cab0f5b))
* **git:** add commit validation types ([#351](https://github.com/salesforce/lwc/issues/351)) ([5c974c9](https://github.com/salesforce/lwc/commit/5c974c9))



<a name="0.21.0"></a>
# [0.21.0](https://github.com/salesforce/lwc/compare/v0.20.5...v0.21.0) (2018-05-29)


### Bug Fixes

* **engine:** live bindings for value and checked properties 3nd attempt ([#340](https://github.com/salesforce/lwc/issues/340)) ([ef4acff](https://github.com/salesforce/lwc/commit/ef4acff))
* **engine:** preserve order of event dispaching between CE and SR ([#309](https://github.com/salesforce/lwc/issues/309)) ([1a1ba17](https://github.com/salesforce/lwc/commit/1a1ba17))
* **engine:** remove piercing membrane ([#324](https://github.com/salesforce/lwc/issues/324)) ([1e4c7f1](https://github.com/salesforce/lwc/commit/1e4c7f1))
* **tests:** fixed event integration test ([#346](https://github.com/salesforce/lwc/issues/346)) ([7402138](https://github.com/salesforce/lwc/commit/7402138))


### Features

* **compiler:** raptor on platform ([#298](https://github.com/salesforce/lwc/issues/298)) ([922de78](https://github.com/salesforce/lwc/commit/922de78))



<a name="0.20.5"></a>
## [0.20.5](https://github.com/salesforce/lwc/compare/v0.20.4...v0.20.5) (2018-05-23)


### Bug Fixes

* event retargeting issue with nested component ([#338](https://github.com/salesforce/lwc/issues/338)) ([a21121b](https://github.com/salesforce/lwc/commit/a21121b))
* getRootNode when composed is false and the element is the root ([#337](https://github.com/salesforce/lwc/issues/337)) ([8dd8392](https://github.com/salesforce/lwc/commit/8dd8392))



<a name="0.20.4"></a>
## [0.20.4](https://github.com/salesforce/lwc/compare/v0.20.3...v0.20.4) (2018-05-21)


### Bug Fixes

* **engine:** Fixing composed on getRootNode call in pierce ([#313](https://github.com/salesforce/lwc/issues/313)) ([6ad3b7c](https://github.com/salesforce/lwc/commit/6ad3b7c))
* Ensure uniqueness of public properties are compile time ([#323](https://github.com/salesforce/lwc/issues/323)) ([bf88354](https://github.com/salesforce/lwc/commit/bf88354))
* Forbid usage of :root pseudo-class selector ([#303](https://github.com/salesforce/lwc/issues/303)) ([7413286](https://github.com/salesforce/lwc/commit/7413286))
* Linting issue introduced by merge on master ([#315](https://github.com/salesforce/lwc/issues/315)) ([6ad80ca](https://github.com/salesforce/lwc/commit/6ad80ca))
* Transform standalone pseudo class selectors ([#310](https://github.com/salesforce/lwc/issues/310)) ([9adea2d](https://github.com/salesforce/lwc/commit/9adea2d))


### Features

* Add support for style injection in compiler ([#302](https://github.com/salesforce/lwc/issues/302)) ([3b754f8](https://github.com/salesforce/lwc/commit/3b754f8))
* Restrict usage of attributes in stylesheets ([#316](https://github.com/salesforce/lwc/issues/316)) ([948fbb9](https://github.com/salesforce/lwc/commit/948fbb9)), closes [#261](https://github.com/salesforce/lwc/issues/261)



<a name="0.20.3"></a>
## [0.20.3](https://github.com/salesforce/lwc/compare/v0.20.2...v0.20.3) (2018-05-15)


### Bug Fixes

* **husky:** fix husky release ([#297](https://github.com/salesforce/lwc/issues/297)) ([75722cb](https://github.com/salesforce/lwc/commit/75722cb))
* upgrade compat packages ([#301](https://github.com/salesforce/lwc/issues/301)) ([cf5f5ae](https://github.com/salesforce/lwc/commit/cf5f5ae))



<a name="0.20.2"></a>
## [0.20.2](https://github.com/salesforce/lwc/compare/v0.20.0...v0.20.2) (2018-05-11)


### Bug Fixes

* **engine:** add existence check in removeChild ([#285](https://github.com/salesforce/lwc/issues/285)) ([81642fd](https://github.com/salesforce/lwc/commit/81642fd))
* **engine:** define setter along with getter in global html attr ([#277](https://github.com/salesforce/lwc/issues/277)) ([5324101](https://github.com/salesforce/lwc/commit/5324101))
* **engine:** fixes [#203](https://github.com/salesforce/lwc/issues/203) - improving error message for iteration key ([#230](https://github.com/salesforce/lwc/issues/230)) ([4ecce8a](https://github.com/salesforce/lwc/commit/4ecce8a))
* **engine:** isBeingConstructed flag is not get out of sync ([#284](https://github.com/salesforce/lwc/issues/284)) ([888bd0d](https://github.com/salesforce/lwc/commit/888bd0d))


### Features

* **compiler:** introduce compile/transform/bundle diagnostics ([#256](https://github.com/salesforce/lwc/issues/256)) ([950d196](https://github.com/salesforce/lwc/commit/950d196))
* **engine:** addEventListener on component instance ([#276](https://github.com/salesforce/lwc/issues/276)) ([a9533af](https://github.com/salesforce/lwc/commit/a9533af))
* **github:** separate features and issues into separate template  ([#281](https://github.com/salesforce/lwc/issues/281)) ([b8889b0](https://github.com/salesforce/lwc/commit/b8889b0))


### Performance Improvements

* Increment performance iterations ([#290](https://github.com/salesforce/lwc/issues/290)) ([d436493](https://github.com/salesforce/lwc/commit/d436493))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/salesforce/lwc/compare/v0.19.0-0...v0.20.0) (2018-04-24)


### Bug Fixes

* **aom:** consolidating the aria dom property names ([#192](https://github.com/salesforce/lwc/issues/192)) ([13cd8c4](https://github.com/salesforce/lwc/commit/13cd8c4))
* Add Safari polyfill for Proxy ([#197](https://github.com/salesforce/lwc/issues/197)) ([e9dc833](https://github.com/salesforce/lwc/commit/e9dc833))
* Misc. compat fixes ([#198](https://github.com/salesforce/lwc/issues/198)) ([480e99a](https://github.com/salesforce/lwc/commit/480e99a))
* Revert preventDefault polyfill ([#207](https://github.com/salesforce/lwc/issues/207)) ([274b81c](https://github.com/salesforce/lwc/commit/274b81c))
* **compiler:** optional second parameter for wire decorator ([#193](https://github.com/salesforce/lwc/issues/193)) ([5eb02f0](https://github.com/salesforce/lwc/commit/5eb02f0)), closes [#181](https://github.com/salesforce/lwc/issues/181)
* **lwc-engine:** Refactor destroy hooks to avoid leaks and guarantee disconnectedCallback ([#204](https://github.com/salesforce/lwc/issues/204)) ([f78a335](https://github.com/salesforce/lwc/commit/f78a335))
* **wire-service:** params is always initialized as an empty object ([#179](https://github.com/salesforce/lwc/issues/179)) ([b969b5c](https://github.com/salesforce/lwc/commit/b969b5c))


### Performance Improvements

* Update best ([#257](https://github.com/salesforce/lwc/issues/257)) ([aca5593](https://github.com/salesforce/lwc/commit/aca5593))



<a name="0.19.0-0"></a>
# [0.19.0-0](https://github.com/salesforce/lwc/compare/v0.18.1...v0.19.0-0) (2018-03-27)


### Bug Fixes

* **compiler:** Compiler errors for missing keys in iterator ([#138](https://github.com/salesforce/lwc/issues/138)) ([de8ee82](https://github.com/salesforce/lwc/commit/de8ee82))
* **engine:** do not use global removeEventListener ([#174](https://github.com/salesforce/lwc/issues/174)) ([ac38122](https://github.com/salesforce/lwc/commit/ac38122))
* **rollup-plugin-lwc-compiler:** Removing any COMPAT code on DEV ([#158](https://github.com/salesforce/lwc/issues/158)) ([7da31a7](https://github.com/salesforce/lwc/commit/7da31a7))
* **wire-service:** compat integration tests ([#178](https://github.com/salesforce/lwc/issues/178)) ([71050f8](https://github.com/salesforce/lwc/commit/71050f8))


### Features

* **commits:** add pre-commit hook for msg validation ([#164](https://github.com/salesforce/lwc/issues/164)) ([13bd495](https://github.com/salesforce/lwc/commit/13bd495))
* **compiler:** Native HTML Attributes + Null removal ([#172](https://github.com/salesforce/lwc/issues/172)) ([45e27cb](https://github.com/salesforce/lwc/commit/45e27cb)), closes [#167](https://github.com/salesforce/lwc/issues/167) [#170](https://github.com/salesforce/lwc/issues/170)
* **engine:** adding support for composed and retargeting ([#141](https://github.com/salesforce/lwc/issues/141)) ([c89c20b](https://github.com/salesforce/lwc/commit/c89c20b))
* **wire-service:** rfc implementation ([#166](https://github.com/salesforce/lwc/issues/166)) ([b1b89e0](https://github.com/salesforce/lwc/commit/b1b89e0)), closes [#148](https://github.com/salesforce/lwc/issues/148)



<a name="0.18.1"></a>
## [0.18.1](https://github.com/salesforce/lwc/compare/v0.18.0...v0.18.1) (2018-03-15)


### Bug Fixes

* **lwc-engine:** Add pragma to engine artifacts ([#156](https://github.com/salesforce/lwc/issues/156)) ([f83397c](https://github.com/salesforce/lwc/commit/f83397c))
* **lwc-wire-service:** Fix project and playground ([#151](https://github.com/salesforce/lwc/issues/151)) ([7c91533](https://github.com/salesforce/lwc/commit/7c91533))


### Features

* **engine:** issue [#153](https://github.com/salesforce/lwc/issues/153) adds a mechanism for LDS to create readonly obj ([#154](https://github.com/salesforce/lwc/issues/154)) ([3de8834](https://github.com/salesforce/lwc/commit/3de8834))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/salesforce/lwc/compare/v0.17.19...v0.18.0) (2018-03-13)


### Bug Fixes

* **script:** Fix aura bin script ([#144](https://github.com/salesforce/lwc/issues/144)) ([1ff7061](https://github.com/salesforce/lwc/commit/1ff7061))


### Features

* **compiler:** attr to props for custom LWC elements ([#102](https://github.com/salesforce/lwc/issues/102)) ([02a1320](https://github.com/salesforce/lwc/commit/02a1320)), closes [#119](https://github.com/salesforce/lwc/issues/119)
* **compiler:** More tooling metadata ([#132](https://github.com/salesforce/lwc/issues/132)) ([0514227](https://github.com/salesforce/lwc/commit/0514227))



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
## [0.17.5](https://github.com/salesforce/lwc/compare/v0.17.2...v0.17.5) (2017-12-26)



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



