/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { describe } from 'vitest';
import { testFixtureDir } from '@lwc/test-utils-lwc-internals';
import { LWC_VERSION } from '@lwc/shared';

import { transform } from '../index';

import type { CssSyntaxError } from 'postcss';

function normalizeError(err: Error) {
    if (err.name === 'CssSyntaxError') {
        return {
            name: err.name,
            reason: (err as CssSyntaxError).reason,
            column: (err as CssSyntaxError).column,
            line: (err as CssSyntaxError).line,
        };
    } else {
        return {
            name: err.name,
            message: err.message,
        };
    }
}

const testFixtures = testFixtureDir(
    {
        root: path.resolve(__dirname, 'fixtures'),
        pattern: '**/actual.css',
    },
    async ({ filename, config }) => {
        let result;
        let error;
        const src = await readFile(filename, 'utf8');

        try {
            result = transform(src, filename, config);
        } catch (err: any) {
            error = err;
        }

        // Replace LWC's version with X.X.X so the snapshots don't frequently change
        const code = result?.code;

        return { code, error };
    }
);

describe('fixtures', async () => {
    await testFixtures({
        'expected.js': ({ code }) =>
            code?.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X'),
        'error.json': ({ error }) =>
            error ? JSON.stringify(normalizeError(error), null, 4) : undefined,
    });
});
