/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import type * as OptionsModule from '../options';
import type { TransformOptions } from '../options';

// Deprecation warnings are gated by module-level latches, so re-import a fresh
// copy of the module in each hook to avoid leaking state across tests.
describe('validateTransformOptions', () => {
    describe('deprecation warnings', () => {
        let validateTransformOptions: typeof OptionsModule.validateTransformOptions;
        let warnSpy: MockInstance<Console['warn']>;

        beforeEach(async () => {
            vi.resetModules();
            ({ validateTransformOptions } = await import('../options'));
            warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
        });

        afterEach(() => {
            warnSpy.mockRestore();
            vi.resetModules();
        });

        const baseOptions: TransformOptions = { name: 'foo', namespace: 'x' };

        test('warns once when enableLwcSpread is passed', () => {
            validateTransformOptions({ ...baseOptions, enableLwcSpread: true });
            validateTransformOptions({ ...baseOptions, enableLwcSpread: true });

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('"enableLwcSpread" property is deprecated')
            );
        });

        test('warns once when stylesheetConfig is passed', () => {
            validateTransformOptions({ ...baseOptions, stylesheetConfig: {} });
            validateTransformOptions({ ...baseOptions, stylesheetConfig: {} });

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('"stylesheetConfig" property is deprecated')
            );
        });

        test('warns every time outputConfig.minify is passed', () => {
            validateTransformOptions({ ...baseOptions, outputConfig: { minify: false } });
            validateTransformOptions({ ...baseOptions, outputConfig: { minify: true } });

            expect(warnSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('"OutputConfig.minify" property is deprecated')
            );
            expect(warnSpy).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('"OutputConfig.minify" property is deprecated')
            );
        });
    });
});
