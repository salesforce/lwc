/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel, type LWCErrorInfo } from '../shared/types';

/**
 * Registry of error codes that should halt compilation which are primarily parsing errors,
 * and unexpected errors, while other errors can still be collected.
 *
 */
const ERROR_LEVEL_OVERRIDES: Record<LWCErrorInfo['code'], DiagnosticLevel> = {
    // Core infrastructure failures
    1001: DiagnosticLevel.Fatal, // GENERIC_COMPILER_ERROR
    1002: DiagnosticLevel.Fatal, // MODULE_RESOLUTION_ERROR
    1004: DiagnosticLevel.Fatal, // NONEXISTENT_FILE
    1005: DiagnosticLevel.Fatal, // NO_AVAILABLE_TRANSFORMER
    1006: DiagnosticLevel.Fatal, // INVALID_SOURCE
    1007: DiagnosticLevel.Fatal, // JS_TRANSFORMER_ERROR
    1008: DiagnosticLevel.Fatal, // HTML_TRANSFORMER_ERROR
    1009: DiagnosticLevel.Fatal, // CSS_TRANSFORMER_ERROR

    // Critical parsing failures
    1003: DiagnosticLevel.Fatal, // INVALID_TEMPLATE
    1052: DiagnosticLevel.Fatal, // GENERIC_PARSING_ERROR
    1053: DiagnosticLevel.Fatal, // IDENTIFIER_PARSING_ERROR
    1058: DiagnosticLevel.Fatal, // INVALID_HTML_SYNTAX
    1083: DiagnosticLevel.Fatal, // TEMPLATE_EXPRESSION_PARSING_ERROR

    // Fundamental template structure
    1072: DiagnosticLevel.Fatal, // MISSING_ROOT_TEMPLATE_TAG
    1075: DiagnosticLevel.Fatal, // MULTIPLE_ROOTS_FOUND
    1078: DiagnosticLevel.Fatal, // NO_MATCHING_CLOSING_TAGS
    1079: DiagnosticLevel.Fatal, // ROOT_TAG_SHOULD_BE_TEMPLATE

    // Critical module resolution
    1010: DiagnosticLevel.Fatal, // IMPORTEE_RESOLUTION_FAILED
    1011: DiagnosticLevel.Fatal, // IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED

    // Essential transformer issues
    1026: DiagnosticLevel.Fatal, // CSS_IN_HTML_ERROR
    1027: DiagnosticLevel.Fatal, // INVALID_ID
} as const;

/**
 * Determines the effective error level for a given error info when strict error classification is enabled.
 *
 * @param errorInfo The error information object
 * @param enableStrictClassification Whether strict error classification is enabled
 * @returns The effective diagnostic level (either original or overridden)
 */
export function getEffectiveErrorLevel(
    errorCode: LWCErrorInfo['code'],
    fallbackErrorLevel: LWCErrorInfo['level']
): DiagnosticLevel {
    if (errorCode in ERROR_LEVEL_OVERRIDES) {
        return ERROR_LEVEL_OVERRIDES[errorCode];
    }
    return fallbackErrorLevel;
}
