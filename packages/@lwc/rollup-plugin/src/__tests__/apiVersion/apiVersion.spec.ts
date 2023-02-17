/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'path';
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

    it('uses lowest API version by default', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {});
        expect(code).toContain(`v: ${LOWEST_API_VERSION}`);
        expect(warnings).toEqual([]);
    });

    it('passes the apiVersion config on to the compiled JS component', async () => {
        const { code, warnings } = await runRollup('fixtures/basic/basic.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain('v: 59');
        expect(warnings).toEqual([]);
    });

    it('component can define itself as v59 using *.js-meta.xml', async () => {
        const { code, warnings } = await runRollup('fixtures/fiftyNine/fiftyNine.js', {});
        expect(code).toContain('v: 59');
        expect(warnings).toEqual([]);
    });

    it('component local definition overrides apiVersion passed in to config', async () => {
        const { code, warnings } = await runRollup('fixtures/fiftyEight/fiftyEight.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain('v: 58');
        expect(warnings).toEqual([]);
    });

    it('handles malformed XML', async () => {
        const { code, warnings } = await runRollup('fixtures/malformed/malformed.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain('v: 59');
        expect(warnings).toHaveLength(1);
        expect(warnings[0].message).toEqual('Ignoring malformed XML file "malformed.js-meta.xml"');
        expect(warnings[0].cause).toBeInstanceOf(Error);
    });

    it('handles missing apiVersion', async () => {
        const { code, warnings } = await runRollup('fixtures/missing/missing.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain('v: 59');
        expect(warnings).toHaveLength(0);
    });

    it('handles apiVersion not a number', async () => {
        const { code, warnings } = await runRollup('fixtures/nonNumber/nonNumber.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain('v: 59');
        expect(warnings).toHaveLength(0);
    });

    it('handles apiVersion lower than lower bound', async () => {
        const { code, warnings } = await runRollup('fixtures/lowBound/lowBound.js', {
            apiVersion: HIGHEST_API_VERSION,
        });
        expect(code).toContain(`v: ${LOWEST_API_VERSION}`);
        expect(warnings).toHaveLength(0);
    });

    it('handles apiVersion higher than high bound', async () => {
        const { code, warnings } = await runRollup('fixtures/highBound/highBound.js', {
            apiVersion: LOWEST_API_VERSION,
        });
        expect(code).toContain(`v: ${HIGHEST_API_VERSION}`);
        expect(warnings).toHaveLength(0);
    });

    it('if within bounds, finds the lowest known version matching the specification', async () => {
        const { code, warnings } = await runRollup('fixtures/decimal/decimal.js', {
            apiVersion: APIVersion.V59_246_WINTER_24,
        });
        expect(code).toContain(`v: 58`);
        expect(warnings).toHaveLength(0);
    });

    it('uses *.js-meta.xml file based on the directory name, not file name', async () => {
        const { code, warnings } = await runRollup('fixtures/differentName/foo.js', {
            apiVersion: APIVersion.V58_244_SUMMER_23,
        });
        expect(code).toContain(`v: 59`);
        expect(warnings).toHaveLength(0);
    });
});
