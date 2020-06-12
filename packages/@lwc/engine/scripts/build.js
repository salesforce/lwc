/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const path = require('path');
const fs = require('fs-extra');

const LWC_ENGINE_DIR = path.resolve(__dirname, '..');
const LWC_ENGINE_DOM_DIR = path.resolve(__dirname, '../../engine-dom');

fs.mkdirp(path.resolve(LWC_ENGINE_DIR, 'dist'));

fs.copySync(
    path.resolve(LWC_ENGINE_DOM_DIR, 'dist/engine-dom.js'),
    path.resolve(LWC_ENGINE_DIR, 'dist/engine.js')
);
fs.copySync(
    path.resolve(LWC_ENGINE_DOM_DIR, 'dist/engine-dom.cjs.js'),
    path.resolve(LWC_ENGINE_DIR, 'dist/engine.cjs.js')
);

fs.copySync(path.resolve(LWC_ENGINE_DOM_DIR, 'types'), path.resolve(LWC_ENGINE_DIR, 'types'));
