/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getFixtures } from '@lwc/test-utils-lwc-internals';
import { LWC_VERSION } from '@lwc/shared';
import { test } from 'vitest';
import { transform } from '../index';
import * as fixtures from './fixtures';

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

test.for(getFixtures(fixtures))(
    '$dirname',
    { concurrent: true },
    async ({ file, dirname, config }, { expect }) => {
        let error: any | undefined;
        let result: string | undefined;

        try {
            result = transform(file, dirname, config).code.replace(
                new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'),
                'X.X.X'
            );
        } catch (err) {
            error = err;
        }

        if (error) {
            await expect(JSON.stringify(normalizeError(error), null, 4)).toMatchFileSnapshot(
                `./fixtures/${dirname}/error.json`
            );
        } else {
            await expect(result).toMatchFileSnapshot(`./fixtures/${dirname}/expected.js`);
        }
    }
);
