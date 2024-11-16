/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe } from '@lwc/test-utils-lwc-internals';
import { LWC_VERSION } from '@lwc/shared';
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

describe.fixtures(fixtures, async ({ file, dirname, config, expect }) => {
    try {
        await expect(
            transform(file, dirname, config).code.replace(
                new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'),
                'X.X.X'
            )
        ).toMatchFileSnapshot(`./fixtures/${dirname}/expected.js`);
    } catch (err: any) {
        await expect(JSON.stringify(normalizeError(err), null, 4)).toMatchFileSnapshot(
            `./fixtures/${dirname}/error.json`
        );
    }
});
