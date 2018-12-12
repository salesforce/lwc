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
    const expectedPath = path.resolve(fixtureDir, 'expected.js');
    const configPath = path.resolve(fixtureDir, 'config.json');
    const errorPath = path.resolve(fixtureDir, 'error.json');

    let actualSource: string;
    if (fs.existsSync(actualPath)) {
        actualSource = fs.readFileSync(actualPath, 'utf8');
    } else {
        throw new Error(`Missing actual file ${actualPath}`);
    }

    let expectedSource: undefined | string;
    if (fs.existsSync(expectedPath)) {
        expectedSource = fs.readFileSync(expectedPath, 'utf8');
    }

    let expectedError: undefined | any;
    if (fs.existsSync(errorPath)) {
        expectedError = require(errorPath);
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
            if (expectedSource) {
                throw err;
            } else {
                error = normalizeError(err);
            }
        }

        if (expectedSource) {
            expect(result).toBe(expectedSource);

            // Assert that the result is valid javascript
            expect(() => parseSync(result)).not.toThrow();
        } else if (expectedError) {
            expect(error).toMatchObject(expectedError);
        } else if (result) {
            // Generate expected file if not present
            fs.writeFileSync(expectedPath, result, 'utf8');
        } else if (error) {
            // Generate expected file if not present
            fs.writeFileSync(errorPath, JSON.stringify(error, null, 4));
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
