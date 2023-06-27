/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { rollup, RollupLog } from 'rollup';
import { APIVersion, HIGHEST_API_VERSION, LOWEST_API_VERSION } from '@lwc/shared';

import lwc, { RollupLwcOptions } from '../../index';

describe('API versioning', () => {
    async function runRollup(
        pathname: string,
        options: RollupLwcOptions
    ): Promise<{ code: string; warnings: RollupLog[] }> {
        const warnings: RollupLog[] = [];
        const bundle = await rollup({
            input: path.resolve(__dirname, pathname),
            plugins: [lwc(options)],
            onwarn(warning) {
                warnings.push(warning);
            },
        });

        const { output } = await bundle.generate({
            format: 'esm',
        });

        return {
            code: output[0].code,
            warnings,
        };
    }

    it('uses highest API version by default', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {});
        expect(code).toContain(`apiVersion: ${HIGHEST_API_VERSION}`);
        expect(warnings).toEqual([]);
    });

    it('passes the apiVersion config on to the compiled JS component', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {
            apiVersion: APIVersion.V58_244_SUMMER_23,
        });
        expect(code).toContain(`apiVersion: ${LOWEST_API_VERSION}`);
        expect(warnings).toEqual([]);
    });

    it('handles apiVersion lower than lower bound', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {
            // @ts-ignore
            apiVersion: 0,
        });
        expect(code).toContain(`apiVersion: ${LOWEST_API_VERSION}`);
        expect(warnings).toHaveLength(0);
    });

    it('handles apiVersion higher than high bound', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {
            // @ts-ignore
            apiVersion: Number.MAX_SAFE_INTEGER,
        });
        expect(code).toContain(`apiVersion: ${HIGHEST_API_VERSION}`);
        expect(warnings).toHaveLength(0);
    });

    it('if within bounds, finds the lowest known version matching the specification', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {
            // @ts-ignore`
            apiVersion: 58.5,
        });
        expect(code).toContain(`apiVersion: 58`);
        expect(warnings).toHaveLength(0);
    });
});
