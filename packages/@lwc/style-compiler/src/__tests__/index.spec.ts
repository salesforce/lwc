/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { describe } from 'vitest';
import { testFixtureDir } from '@lwc/test-utils-lwc-internals';
import { LWC_VERSION } from '@lwc/shared';

import { transform, type Config } from '../index';

import type { CssSyntaxError } from 'postcss';

function normalizeError(err: Error) {
    if (err instanceof AggregateError) {
        return err.errors.map(({ name, reason, column, line }) => ({
            name,
            reason,
            column,
            line,
        }));
    }

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

describe('fixtures', () => {
    testFixtureDir<Config>(
        {
            root: path.resolve(import.meta.dirname, 'fixtures'),
            pattern: '**/actual.css',
            ssrVersion: 2,
        },
        ({ src, filename, config }) => {
            let result;
            let error;

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

            return {
                'expected.js': code,
                'error.json': error,
            };
        }
    );
});
