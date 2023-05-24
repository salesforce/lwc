/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '../../shared/types';
import { CompilerInstrumentation, CompilerMetrics } from '../instrumentation';

const DEFAULT_LOCATION = {
    line: 1,
    column: 22,
    start: 22,
    length: 8,
};

const GENERIC_COMPILER_LOG = {
    code: 1234,
    message: 'Generic info log with message: {0}',
    level: DiagnosticLevel.Log,
};

describe('instrumentation', () => {
    describe('diagnostics', () => {
        it('generates and stores a compiler diagnostic when log is called', () => {
            const instrumentation = new CompilerInstrumentation();
            instrumentation.log(GENERIC_COMPILER_LOG, {
                messageArgs: ['generic message'],
                origin: {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                },
            });

            expect(instrumentation.diagnostics.length).toBe(1);
            expect(instrumentation.diagnostics[0]).toEqual({
                code: 1234,
                message: 'LWC1234: Generic info log with message: generic message',
                level: DiagnosticLevel.Log,
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            });
        });
    });

    describe('metrics', () => {
        it('properly tracks metric counts for a defined metric', () => {
            const instrumentation = new CompilerInstrumentation();
            const metric = CompilerMetrics.LWCRenderModeDirective;

            expect(instrumentation.metrics[metric]).toBeUndefined();

            for (let i = 0; i < 10; i++) {
                instrumentation.incrementCounter(metric);
            }
            expect(instrumentation.metrics[metric]).toBe(10);
        });
    });
});
