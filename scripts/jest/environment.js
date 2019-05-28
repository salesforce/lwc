/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const fs = require('fs');
const vm = require('vm');
const JSDOMEnvironment = require('jest-environment-jsdom-fifteen');
const polyfillFile = require.resolve('@lwc/synthetic-shadow');
const polyfillSource = fs.readFileSync(polyfillFile, 'utf-8');
const polyfillScript = vm.createScript(polyfillSource, '@lwc/synthetic-shadow');

/** Synthetic Shadow Polyfill should be installed only once per worker */
function _syntheticShadow(env) {
    if (env.dom) {
        env.dom.runVMScript(polyfillScript);
        // eslint-disable-next-line no-func-assign
        _syntheticShadow = function _syntheticShadow() {
            /* noop */
        };
    }
}

module.exports = class JSDOMEnvironmentWithSyntheticShadow extends JSDOMEnvironment {
    constructor(config, options = {}) {
        super(config, options);

        // Running the synthetic-shadow polyfill
        _syntheticShadow(this);

        // Instrinsics that should be transferred to each environment
        this.global.ShadowRoot = this.dom.window.ShadowRoot;
        this.global.HTMLSlotElement = this.dom.window.HTMLSlotElement;
    }
};
