/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Replaces code wrapped in blocks like this:
//
// /* --begin-karma-only-code--
//   CODE GOES HERE
// --end-karma-only-code-- */
//
// ...with de-commented code.
//
// This allows us to have special Karma-only code that never leaks outside LWC OSS.
// The reason we don't use NODE_ENV for this is that we want Karma to be able to test
// both production mode and dev mode.
'use strict';

const MagicString = require('magic-string');
const Watcher = require('./Watcher');

function createPreprocessor(config, emitter, logger) {
    const log = logger.create('preprocessor-karma-only-code');
    const watcher = new Watcher(config, emitter, log);

    return (code, file, done) => {
        const input = file.path;

        watcher.watchSuite(input, []);

        const magicString = new MagicString(code);
        magicString.replaceAll('/* --begin-karma-only-code--', '');
        magicString.replaceAll('--end-karma-only-code-- */', '');

        const map = magicString.generateMap({
            source: file.path,
            includeContent: true,
        });

        let output = magicString.toString();

        // Source maps cause an error in coverage mode ("don't know how to turn this value into a node"), so skip it
        if (!process.env.COVERAGE) {
            output += `\n//# sourceMappingURL=${map.toUrl()}\n`;

            // We need to assign the source to the original file so Karma can source map the error in the console.
            // also adding the source map inline for browser debugging.
            // eslint-disable-next-line require-atomic-updates
            file.sourceMap = map;
        }

        done(null, output);
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:karma-only-code': ['factory', createPreprocessor] };
