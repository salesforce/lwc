/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
import { DiagnosticLevel } from '../../shared/types';
import { getEffectiveErrorLevel } from '../error-level-overrides';

describe('error-level-overrides', () => {
    describe('getEffectiveErrorLevel', () => {
        it('should return Fatal level for error codes in the override registry', () => {
            expect(getEffectiveErrorLevel(1001, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal);
            expect(getEffectiveErrorLevel(1052, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal);
            expect(getEffectiveErrorLevel(1072, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal);
            expect(getEffectiveErrorLevel(1002, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Fatal);
        });

        it('should return fallback level for error codes not in the override registry', () => {
            expect(getEffectiveErrorLevel(1041, DiagnosticLevel.Warning)).toBe(
                DiagnosticLevel.Warning
            );
            expect(getEffectiveErrorLevel(9999, DiagnosticLevel.Error)).toBe(DiagnosticLevel.Error); // Non-existent error code
        });
    });
});
