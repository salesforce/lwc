/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { DiagnosticLevel } from '../../shared/types';
import {
    generateCompilerDiagnostic,
    generateCompilerError,
    normalizeToDiagnostic,
} from '../errors';
import { CompilerValidationErrors, ParserDiagnostics } from '../error-info';

describe('error generation with strict classification', () => {
    describe('generateCompilerDiagnostic', () => {
        it('should use original level when strict classification is disabled', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo);
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });

        it('should upgrade Error to Fatal when strict classification is enabled', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should upgrade Error to Fatal for template structure errors when strict classification is enabled', () => {
            const errorInfo = {
                code: 1072, // MISSING_ROOT_TEMPLATE_TAG
                message: 'Missing root template tag',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should upgrade Error to Fatal for module resolution errors when strict classification is enabled', () => {
            const errorInfo = {
                code: 1002, // MODULE_RESOLUTION_ERROR
                message: 'Module resolution error',
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
        it('should use original level when strict classification is disabled', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const error = generateCompilerError(errorInfo);
            expect(error.level).toBe(DiagnosticLevel.Error);
        });

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

    describe('normalizeToDiagnostic', () => {
        it('should use original level for regular errors', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = normalizeToDiagnostic(errorInfo, new Error('Test error'));
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });

        it('should preserve CompilerError level when normalizing', () => {
            const errorInfo = {
                code: 1052, // GENERIC_PARSING_ERROR
                message: 'Test parsing error',
                level: DiagnosticLevel.Error,
            };

            // Create a CompilerError with original level (not upgraded)
            const compilerError = generateCompilerError(errorInfo);
            expect(compilerError.level).toBe(DiagnosticLevel.Error);

            const diagnostic = normalizeToDiagnostic(errorInfo, compilerError);
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });
    });

    describe('integration with actual error definitions', () => {
        it('should use original level for CompilerValidationErrors by default', () => {
            const diagnostic = generateCompilerDiagnostic(
                CompilerValidationErrors.INVALID_COMPAT_PROPERTY
            );
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });

        it('should upgrade CompilerValidationErrors when strict classification is enabled', () => {
            const diagnostic = generateCompilerDiagnostic(
                CompilerValidationErrors.INVALID_COMPAT_PROPERTY,
                undefined,
                true
            );
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should use original level for ParserDiagnostics by default', () => {
            const diagnostic = generateCompilerDiagnostic(ParserDiagnostics.GENERIC_PARSING_ERROR);
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });

        it('should upgrade ParserDiagnostics when strict classification is enabled', () => {
            const diagnostic = generateCompilerDiagnostic(
                ParserDiagnostics.GENERIC_PARSING_ERROR,
                undefined,
                true
            );
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should handle comprehensive error categories when strict classification is enabled', () => {
            // Test various error categories that should be upgraded when enabled
            const parsingError = generateCompilerDiagnostic(
                {
                    code: 1053, // IDENTIFIER_PARSING_ERROR
                    message: 'Identifier parsing error',
                    level: DiagnosticLevel.Error,
                },
                undefined,
                true
            );
            expect(parsingError.level).toBe(DiagnosticLevel.Fatal);

            const templateError = generateCompilerDiagnostic(
                {
                    code: 1075, // MULTIPLE_ROOTS_FOUND
                    message: 'Multiple roots found',
                    level: DiagnosticLevel.Error,
                },
                undefined,
                true
            );
            expect(templateError.level).toBe(DiagnosticLevel.Fatal);

            const transformerError = generateCompilerDiagnostic(
                {
                    code: 1008, // HTML_TRANSFORMER_ERROR
                    message: 'HTML transformer error',
                    level: DiagnosticLevel.Error,
                },
                undefined,
                true
            );
            expect(transformerError.level).toBe(DiagnosticLevel.Fatal);
        });
    });
});
