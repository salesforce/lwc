/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
import { rollup } from 'rollup';

import lwc from '../../index';

describe('rootDir', () => {
    it('warns if an "input" array is passed and when "rootDir" is not set', async () => {
        const warnings: any = [];

        await rollup({
            input: [
                path.resolve(__dirname, 'fixtures/entryA.js'),
                path.resolve(__dirname, 'fixtures/entryB.js'),
            ],
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            message: expect.stringMatching(
                /^The "rootDir" option should be explicitly set when passing an "input" array to rollup\. The "rootDir" option is implicitly resolved to .*\/fixtures.$/
            ),
            code: 'PLUGIN_WARNING',
            plugin: 'rollup-plugin-lwc-compiler',
        });
    });

    it('warns if an "input" object is passed and when "rootDir" is not set', async () => {
        const warnings: any = [];

        await rollup({
            input: {
                entryA: path.resolve(__dirname, 'fixtures/entryA.js'),
                entryB: path.resolve(__dirname, 'fixtures/entryB.js'),
            },
            plugins: [lwc()],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toMatchObject({
            message: expect.stringMatching(
                /^The "rootDir" option should be explicitly set when passing "input" object to rollup\. The "rootDir" option is implicitly resolved to .*\/fixtures.$/
            ),
            code: 'PLUGIN_WARNING',
            plugin: 'rollup-plugin-lwc-compiler',
        });
    });
});
