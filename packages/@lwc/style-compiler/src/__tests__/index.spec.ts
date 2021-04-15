/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import { transform } from '../index';

testFixtureDir(path.resolve(__dirname, 'fixtures'), (dir) => {
    const inputPath = path.resolve(dir, 'actual.css');
    const configPath = path.resolve(dir, 'config.json');

    const src = fs.readFileSync(inputPath, 'utf8');

    let config: any = {};
    if (fs.existsSync(configPath)) {
        config = require(configPath);
    }

    let result;
    let error;

    try {
        result = transform(src, inputPath, config);
    } catch (err) {
        error = JSON.stringify(normalizeError(error), null, 4);
    }

    return {
        'expected.js': result?.code,
        'error.json': error,
    };
});

function normalizeError(err) {
    if (err.name === 'CssSyntaxError') {
        return {
            name: err.name,
            reason: err.reason,
            column: err.column,
            line: err.line,
        };
    } else {
        return {
            name: err.name,
            message: err.message,
        };
    }
}
