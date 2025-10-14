/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { DiagnosticLevel } from '../../shared/types';
import {
    getEffectiveErrorLevel,
    getUpgradedErrorCodes,
    isUpgradedToFatal,
} from '../error-level-overrides';
import { CompilerValidationErrors, ParserDiagnostics } from '../error-info';

describe('error-level-overrides', () => {
    describe('getEffectiveErrorLevel', () => {
        it('should return Fatal level for error codes in the override registry', () => {
            expect(getEffectiveErrorLevel(1001, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // GENERIC_COMPILER_ERROR
            expect(getEffectiveErrorLevel(1052, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // GENERIC_PARSING_ERROR
            expect(getEffectiveErrorLevel(1072, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // MISSING_ROOT_TEMPLATE_TAG
            expect(getEffectiveErrorLevel(1002, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // MODULE_RESOLUTION_ERROR
        });

        it('should return fallback level for error codes not in the override registry', () => {
            expect(getEffectiveErrorLevel(1041, DiagnosticLevel.Warning)).toBe(
                DiagnosticLevel.Warning
            ); // INVALID_STATIC_ID_IN_ITERATION
            expect(getEffectiveErrorLevel(9999, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Error); // Non-existent error code
        });

        it('should handle all categories of fatal errors', () => {
            // Parsing errors
            expect(getEffectiveErrorLevel(1053, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // IDENTIFIER_PARSING_ERROR
            expect(getEffectiveErrorLevel(1083, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // TEMPLATE_EXPRESSION_PARSING_ERROR

            // Template structure errors
            expect(getEffectiveErrorLevel(1075, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // MULTIPLE_ROOTS_FOUND
            expect(getEffectiveErrorLevel(1078, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // NO_MATCHING_CLOSING_TAGS

            // Transformer errors
            expect(getEffectiveErrorLevel(1005, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // NO_AVAILABLE_TRANSFORMER
            expect(getEffectiveErrorLevel(1007, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal); // JS_TRANSFORMER_ERROR
        });
    });

    describe('getUpgradedErrorCodes', () => {
        it('should return comprehensive list of error codes that get upgraded to Fatal', () => {
            const upgradedCodes = getUpgradedErrorCodes();

            // Verify key error categories are included
            expect(upgradedCodes).toContain(1001); // GENERIC_COMPILER_ERROR
            expect(upgradedCodes).toContain(1052); // GENERIC_PARSING_ERROR
            expect(upgradedCodes).toContain(1072); // MISSING_ROOT_TEMPLATE_TAG
            expect(upgradedCodes).toContain(1002); // MODULE_RESOLUTION_ERROR
            expect(upgradedCodes).toContain(1013); // INVALID_COMPAT_PROPERTY

            // Verify the registry contains all expected categories
            expect(upgradedCodes.length).toBeGreaterThan(30); // Should have comprehensive coverage
        });
    });

    describe('isUpgradedToFatal', () => {
        it('should correctly identify error codes that get upgraded to Fatal', () => {
            expect(isUpgradedToFatal(1001)).toBe(true); // GENERIC_COMPILER_ERROR
            expect(isUpgradedToFatal(1052)).toBe(true); // GENERIC_PARSING_ERROR
            expect(isUpgradedToFatal(1072)).toBe(true); // MISSING_ROOT_TEMPLATE_TAG
            expect(isUpgradedToFatal(1013)).toBe(true); // INVALID_COMPAT_PROPERTY
        });

        it('should return false for error codes that do not get upgraded', () => {
            expect(isUpgradedToFatal(1041)).toBe(false); // INVALID_STATIC_ID_IN_ITERATION (Warning)
            expect(isUpgradedToFatal(9999)).toBe(false); // Non-existent error code
        });
    });

    describe('integration with actual error definitions', () => {
        it('should work with actual CompilerValidationErrors', () => {
            const result = getEffectiveErrorLevel(
                CompilerValidationErrors.INVALID_COMPAT_PROPERTY.code,
                CompilerValidationErrors.INVALID_COMPAT_PROPERTY.level
            );
            expect(result).toBe(DiagnosticLevel.Fatal);
        });

        it('should work with actual ParserDiagnostics', () => {
            const result = getEffectiveErrorLevel(
                ParserDiagnostics.GENERIC_PARSING_ERROR.code,
                ParserDiagnostics.GENERIC_PARSING_ERROR.level
            );
            expect(result).toBe(DiagnosticLevel.Fatal);
        });
    });
});
