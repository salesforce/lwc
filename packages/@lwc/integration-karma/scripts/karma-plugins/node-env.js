/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This transformation replaces:
 *     process.env.NODE_ENV === 'test-karma-lwc'
 * with:
 *     true
 */
'use strict';

const MagicString = require('magic-string');
const Watcher = require('./Watcher');

function createPreprocessor(config, emitter, logger) {
    const log = logger.create('preprocessor-node-env');
    const watcher = new Watcher(config, emitter, log);

    return (code, file, done) => {
        const input = file.path;

        watcher.watchSuite(input, []);

        const magicString = new MagicString(code);
        magicString.replaceAll(`process.env.NODE_ENV === 'test-karma-lwc'`, `true`);

        const map = magicString.generateMap({
            source: file.path,
            includeContent: true,
        });

        const output = magicString.toString() + `\n//# sourceMappingURL=${map.toUrl()}\n`;

        // We need to assign the source to the original file so Karma can source map the error in the console. Add
        // also adding the source map inline for browser debugging.
        // eslint-disable-next-line require-atomic-updates
        file.sourceMap = map;

        done(null, output);
    };
}

createPreprocessor.$inject = ['config', 'emitter', 'logger'];

module.exports = { 'preprocessor:node-env': ['factory', createPreprocessor] };
