/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const chokidar = require('chokidar');

module.exports = class Watcher {
    constructor(config, emitter, logger) {
        const { basePath } = config;

        this._suiteDependencyLookup = {};

        this._watcher = chokidar.watch(basePath, {
            ignoreInitial: true,
        });

        this._watcher.on('all', (_type, filename) => {
            logger.info(`Change detected ${path.relative(basePath, filename)}`);

            for (const [input, dependencies] of Object.entries(this._suiteDependencyLookup)) {
                if (dependencies.includes(filename)) {
                    // This is not a Karma public API, but it does the trick. This internal API has
                    // been pretty stable for a while now, so the probability it break is fairly
                    // low.
                    emitter._fileList.changeFile(input, true);
                }
            }
        });
    }

    watchSuite(input, dependencies) {
        this._suiteDependencyLookup[input] = dependencies;
    }
};
