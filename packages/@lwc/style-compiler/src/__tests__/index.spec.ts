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
            error = JSON.stringify(normalizeError(err), null, 4);
        }

        // Replace LWC's version with X.X.X so the snapshots don't frequently change
        let code = result?.code;
        if (code) {
            code = code.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');
        }

        return { code, error };
    },
    {
        'expected.js': ({ code }) => code,
        'error.json': ({ error }) => error,
    }
);

describe('fixtures', async () => {
    await testFixtures();
});
