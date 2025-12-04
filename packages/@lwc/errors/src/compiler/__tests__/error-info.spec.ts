/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, expect, it } from 'vitest';
import * as errorInfo from '../error-info';
import { DiagnosticLevel } from '../../shared/types';
import {
    generateCompilerDiagnostic,
    generateCompilerError,
    normalizeToDiagnostic,
    CompilerError,
} from '../errors';
// All exported objects are maps of label/error info, except for GENERIC_COMPILER_ERROR,
// which is a top-level error info object
const { GENERIC_COMPILER_ERROR, ...errors } = errorInfo;

const errorInfoMatcher = {
    code: expect.any(Number),
    message: expect.any(String),
    url: expect.any(String),
    // Technically not *any* number, but vitest doesn't have oneOf
    level: expect.any(Number),
};

it('GENERIC_COMPILER_ERROR should be an error info object', () => {
    expect(GENERIC_COMPILER_ERROR).toEqual(expect.objectContaining(errorInfoMatcher));
});

describe.each(Object.entries(errors))('%s errors', (_key, map) => {
    it('labels should all be UPPER_SNAKE_CASE', () => {
        Object.keys(map).forEach((label) => {
            expect(label).toMatch(/^[A-Z]+(?:_[A-Z]+?)*?$/);
        });
    });
    it.each(Object.entries(map))('%s should be an error info object', (_label, info) => {
        expect(info).toEqual(expect.objectContaining(errorInfoMatcher));
    });
});

it('error codes are unique', () => {
    // Map of error codes to the errors that use them
    const seen = new Map([[GENERIC_COMPILER_ERROR.code, ['GENERIC_COMPILER_ERROR']]]);
    Object.entries(errors).forEach(([key, map]) => {
        Object.entries(map).forEach(([label, info]) => {
            const path = `${key}.${label}`;
            const prev = seen.get(info.code) ?? [];
            seen.set(info.code, [...prev, path]);
        });
    });
    // This assertion prints errors that use the same code for easier debugging
    for (const arr of seen.values()) {
        expect(arr).toHaveLength(1);
    }
});

it('errors with strictLevel have correct DiagnosticLevel.Fatal value', () => {
    // List of error codes that should have strictLevel: DiagnosticLevel.Fatal
    const fatalErrorCodes = [
        1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1026, 1027, 1052, 1053,
        1058, 1072, 1075, 1078, 1079, 1083,
    ];

    // Check GENERIC_COMPILER_ERROR
    if (fatalErrorCodes.includes(GENERIC_COMPILER_ERROR.code)) {
        // eslint-disable-next-line vitest/no-conditional-expect
        expect(GENERIC_COMPILER_ERROR.strictLevel).toBe(DiagnosticLevel.Fatal);
    }

    // Check all other errors
    Object.entries(errors).forEach(([_key, map]) => {
        Object.entries(map).forEach(([_label, info]) => {
            if (fatalErrorCodes.includes(info.code)) {
                // eslint-disable-next-line vitest/no-conditional-expect
                expect(info.strictLevel).toBe(DiagnosticLevel.Fatal);
            }
        });
    });
});

describe('error generation with strict classification enabled', () => {
    describe('generateCompilerDiagnostic', () => {
        it('should upgrade Error to Fatal when strict classification is enabled', () => {
            const diagnostic = generateCompilerDiagnostic(
                errors.ParserDiagnostics.GENERIC_PARSING_ERROR,
                undefined,
                true
            );
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should not affect Warning level errors even when strict classification is enabled', () => {
            const diagnostic = generateCompilerDiagnostic(
                errors.ParserDiagnostics.INVALID_STATIC_ID_IN_ITERATION,
                undefined,
                true
            );
            expect(diagnostic.level).toBe(DiagnosticLevel.Warning);
        });

        it('should not upgrade errors without strictLevel when strict classification is enabled', () => {
            const errorInfo = {
                code: 404, // Non-existent error code
                message: 'Error not found',
                level: DiagnosticLevel.Error,
            };

            const diagnostic = generateCompilerDiagnostic(errorInfo, undefined, true);
            expect(diagnostic.level).toBe(DiagnosticLevel.Error);
        });
    });

    describe('generateCompilerError', () => {
        it('should upgrade Error to Fatal when strict classification is enabled', () => {
            const error = generateCompilerError(
                errors.ParserDiagnostics.GENERIC_PARSING_ERROR,
                undefined,
                true
            );
            expect(error.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should upgrade Error to Fatal for transformer errors when strict classification is enabled', () => {
            const error = generateCompilerError(
                errors.TransformerErrors.JS_TRANSFORMER_ERROR,
                undefined,
                true
            );
            expect(error.level).toBe(DiagnosticLevel.Fatal);
        });
    });

    describe('normalizeToDiagnostic', () => {
        it('should NOT override level of existing compilerError', () => {
            const compilerError = new CompilerError(
                999,
                'Test error',
                undefined,
                undefined,
                DiagnosticLevel.Fatal
            );
            const diagnostic = normalizeToDiagnostic(
                errors.ParserDiagnostics.GENERIC_PARSING_ERROR,
                compilerError,
                undefined,
                true
            );

            expect(diagnostic.code).toBe(999);
            expect(diagnostic.message).toBe('Test error');
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });

        it('should override level of errors', () => {
            const compilerError = new Error('Custom Error');
            (compilerError as any).level = DiagnosticLevel.Error;
            (compilerError as any).strictLevel = DiagnosticLevel.Fatal;
            (compilerError as any).code = 999;
            const diagnostic = normalizeToDiagnostic(
                errors.ParserDiagnostics.GENERIC_PARSING_ERROR,
                compilerError,
                undefined,
                true
            );

            expect(diagnostic.code).toBe(999);
            expect(diagnostic.level).toBe(DiagnosticLevel.Fatal);
        });
    });
});
