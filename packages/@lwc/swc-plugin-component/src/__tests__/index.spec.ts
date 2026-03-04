/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import fs from 'node:fs';
import { globSync } from 'glob';
import { describe, it, expect } from 'vitest';
import { LWC_VERSION, HIGHEST_API_VERSION } from '@lwc/shared';
import { CompilerAggregateError } from '@lwc/errors';
import { transformComponentSync } from '../index';
import type { LwcSwcPluginOptions } from '../types';

const BASE_OPTS: LwcSwcPluginOptions = {
    namespace: 'lwc',
    name: 'test',
    filename: 'test.js',
};

// Resolve the fixtures directory relative to this file
// __dirname-equivalent via import.meta
const FIXTURES_DIR = path.resolve(
    new URL(import.meta.url).pathname,
    '../../../../../@lwc/babel-plugin-component/src/__tests__/fixtures'
);

function normalizeError(err: any): object {
    const normalized: any = {
        message: err.message,
    };
    if (err.loc) normalized.loc = err.loc;
    if (err.filename) normalized.filename = path.basename(err.filename);
    return normalized;
}

function transformFixture(
    source: string,
    config: Partial<LwcSwcPluginOptions> = {}
): {
    code?: string;
    error?: object;
} {
    const options: LwcSwcPluginOptions = {
        ...BASE_OPTS,
        ...config,
    };

    try {
        const result = transformComponentSync(source, options);
        let { code } = result;

        // Replace LWC's version with X.X.X so the snapshots don't frequently change
        code = code!.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');

        // Replace the latest API version as well
        code = code.replace(
            new RegExp(`apiVersion: ${HIGHEST_API_VERSION}`, 'g'),
            `apiVersion: 9999999`
        );

        return { code };
    } catch (err: any) {
        let error: object;
        if (err instanceof CompilerAggregateError && err.errors?.length > 0) {
            error = normalizeError(err.errors[0]);
        } else {
            error = normalizeError(err);
        }
        return { error };
    }
}

// Dynamically discover and test all fixtures
const fixtureFiles = globSync('**/actual.js', {
    cwd: FIXTURES_DIR,
    absolute: true,
});

describe('fixtures', () => {
    for (const actualPath of fixtureFiles) {
        const fixtureDir = path.dirname(actualPath);
        const relPath = path.relative(FIXTURES_DIR, actualPath);
        const fixtureName = path.dirname(relPath);

        it(relPath, async () => {
            const source = fs.readFileSync(actualPath, 'utf-8');

            // Load config.json if present
            let config: Partial<LwcSwcPluginOptions> = {};
            const configPath = path.join(fixtureDir, 'config.json');
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }

            const result = transformFixture(source, config);

            // Check code output
            const swcExpectedPath = path.join(fixtureDir, 'swc-expected.js');
            if (result.code !== undefined) {
                await expect(result.code).toMatchFileSnapshot(swcExpectedPath);
            }

            // Check error output
            const swcErrorPath = path.join(fixtureDir, 'swc-error.json');
            if (result.error !== undefined) {
                await expect(JSON.stringify(result.error, null, 4) + '\n').toMatchFileSnapshot(
                    swcErrorPath
                );
            }
        });
    }
});
