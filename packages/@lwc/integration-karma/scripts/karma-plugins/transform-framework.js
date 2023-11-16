/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This transformation converts ESM format to IIFE format. We prefer IIFE format in our Karma tests.
 * It also converts some process.env.NODE_ENV code; see below.
 */
'use strict';

const MagicString = require('magic-string');
const Watcher = require('./Watcher');

function getIifeName(filename) {
    if (filename.includes('@lwc/engine-dom')) {
        return 'LWC';
    } else if (filename.includes('@lwc/wire-service')) {
        return 'WireService';
    } else if (filename.includes('@lwc/synthetic-shadow')) {
        // synthetic shadow does not need an IIFE name
        return undefined;
    } else if (filename.includes('aria-reflection')) {
        // aria reflection global polyfill does not need an IIFE name
        return undefined;
    }
    throw new Error(`Unknown framework filename, not sure which IIFE name to use: ${filename}`);
}

function createPreprocessor(config, emitter, logger) {
    const log = logger.create('preprocessor-transform-framework');
    const watcher = new Watcher(config, emitter, log);

    return async (content, file, done) => {
        const input = file.path;
        const iifeName = getIifeName(input);

        watcher.watchSuite(input, []);

        // Strip sourcemaps here because Karma can't actually host the .map file
        const magicString = new MagicString(content.replace(/\/\/# sourceMappingURL=\S+/, ''));

        /**
         * This transformation replaces:
         *     process.env.NODE_ENV === 'test-karma-lwc'
         * with:
         *     true
         *
         * You might wonder why we replace the whole thing rather than just `process.env.NODE_ENV`. Well, because we need a way
         * to test `process.env.NODE_ENV === "production"` (prod mode) vs `process.env.NODE_ENV !== "production"` (dev mode).
         * If we replaced `process.env.NODE_ENV`, then that would be impossible.
         *
         * Then you might wonder why we call it "test-karma-lwc" rather than something simple like "test". Well, because
         * "test" was already squatted by Jest, and we actually use it for Jest-specific (not Karma-specific) behavior:
         * - https://jestjs.io/docs/environment-variables#node_env
         * - https://github.com/search?q=repo%3Asalesforce%2Flwc%20node_env%20%3D%3D%3D%20%27test%27&type=code
         *
         * Then you might wonder why we don't invent our own thing like `process.env.IS_KARMA`. Well, because we're testing
         * the artifacts we ship in the npm package, and we can't expect our consumers to replace the string
         * `process.env.IS_KARMA`, although we do expect them to replace `process.env.NODE_ENV` (usually with "production").
         *
         * Then you might wonder why we don't just use a runtime check like `typeof __karma__ !== 'undefined'`. And the reason
         * for that is that we want Karma-specific code to be tree-shaken in prod mode. (Assuming our consumers are replacing
         * `process.env.NODE_ENV` with "production".)
         *
         * So then you might wonder why we test against the same artifacts we ship, rather than testing against Karma-specific
         * artifacts. And that's totally reasonable, but then it introduces the risk that we're not testing our "real"
         * artifacts.
         *
         * So that's why this is so weird and complicated. I'm sorry.
         */
        magicString.replaceAll(`process.env.NODE_ENV === 'test-karma-lwc'`, 'true');

        magicString.prepend(`${iifeName ? `var ${iifeName} = ` : ''}(function (exports) {\n`);
        magicString.append('\nreturn exports;\n})({});\n');

        const code = magicString.toString();

        // We need to assign the source to the original file so Karma can source map the error in the console.
        // also adding the source map inline for browser debugging.
        // eslint-disable-next-line require-atomic-updates
        file.sourceMap = magicString.generateMap();

        done(null, code);
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:transform-framework': ['factory', createPreprocessor] };
