/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LWC_VERSION } from '@lwc/shared';
import prettier from 'prettier';
import { describe } from '@lwc/test-utils-lwc-internals';
import compiler from '../index';
import * as fixtures from './fixtures';

const LWC_VERSION_REGEX = new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g');

describe.fixtures(fixtures, async ({ file, config, expect, dirname, basename }) => {
    const { warnings, root, code } = compiler(file, basename, {
        namespace: 'x',
        name: basename,
        ...config,
    });

    await Promise.all([
        expect(
            prettier.format(code.replace(LWC_VERSION_REGEX, 'X.X.X'), {
                parser: 'babel',
                trailingComma: 'es5',
            })
        ).resolves.toMatchFileSnapshot(`./fixtures/${dirname}/expected.js`),
        expect(JSON.stringify({ root }, null, 4)).toMatchFileSnapshot(
            `./fixtures/${dirname}/ast.json`
        ),
        expect(JSON.stringify({ warnings }, null, 4)).toMatchFileSnapshot(
            `./fixtures/${dirname}/metadata.json`
        ),
    ]);
});
