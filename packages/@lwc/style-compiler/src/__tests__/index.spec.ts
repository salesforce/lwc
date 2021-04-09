/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { parseSync } from '@babel/core';

import { transform } from '../index';

const FIXTURES_PATH = path.resolve(__dirname, 'fixtures');

fs.readdirSync(FIXTURES_PATH).forEach((fixtureName: string) => {
    const fixtureDir = path.resolve(FIXTURES_PATH, fixtureName);
    const stats = fs.statSync(fixtureDir);

    // Ignore non directory fixtures
    if (!stats.isDirectory()) {
        return;
    }

    test(fixtureName, testFixture(fixtureDir));
});

function testFixture(fixtureDir: string) {
    const actualPath = path.resolve(fixtureDir, 'actual.css');
    const configPath = path.resolve(fixtureDir, 'config.json');

    let actualSource: string;
    if (fs.existsSync(actualPath)) {
        actualSource = fs.readFileSync(actualPath, 'utf8');
    } else {
        throw new Error(`Missing actual file ${actualPath}`);
    }

    let config: any = {};
    if (fs.existsSync(configPath)) {
        config = require(configPath);
    }

    return () => {
        let result;
        let error;

        try {
            const { code } = transform(actualSource, actualPath, config);
            result = code;
        } catch (err) {
            error = normalizeError(err);
        }

        if (error) {
            expect(error).toMatchSnapshot();
        } else {
            expect(result).toMatchSnapshot();
            // Assert that the result is valid javascript
            expect(() => parseSync(result, { babelrc: false, configFile: false })).not.toThrow();
        }
    };
}

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
