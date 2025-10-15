/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { DiagnosticLevel } from '../../shared/types';
import { generateCompilerDiagnostic, generateCompilerError } from '../errors';

describe('error generation with strict classification enabled', () => {
    describe('generateCompilerDiagnostic', () => {
        it('should upgrade Error to Fatal when strict classification is enabled', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should not affect Warning level errors even when strict classification is enabled', () => {
            const errorInfo = {
                code: 1041, // INVALID_STATIC_ID_IN_ITERATION (Warning)
                message: 'Invalid static id',
                level: DiagnosticLevel.Warning,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Warning);
        });

        it('should not upgrade errors not in the override registry when strict classification is enabled', () => {
            const errorInfo = {
                code: 9999, // Non-existent error code
                message: 'Unknown error',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });
    });

    describe('generateCompilerError', () => {
        it('should upgrade Error to Fatal when strict classification is enabled', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const error = generateCompilerError(errorInfo, undefined, true);
            expect(error.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should upgrade Error to Fatal for transformer errors when strict classification is enabled', () => {
            const errorInfo = {
                code: 1007, // JS_TRANSFORMER_ERROR
                message: 'JS transformer error',
                level: DiagnosticLevel.Error,
            };

            const error = generateCompilerError(errorInfo, undefined, true);
            expect(error.level).toBe(DiagnosticLevel.Fatal);
        });
    });
});
