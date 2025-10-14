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
    // Generic compiler errors
    1001: DiagnosticLevel.Fatal, // GENERIC_COMPILER_ERROR
    1003: DiagnosticLevel.Fatal, // INVALID_TEMPLATE

    // Parsing errors
    1052: DiagnosticLevel.Fatal, // GENERIC_PARSING_ERROR
    1053: DiagnosticLevel.Fatal, // IDENTIFIER_PARSING_ERROR
    1083: DiagnosticLevel.Fatal, // TEMPLATE_EXPRESSION_PARSING_ERROR
    1058: DiagnosticLevel.Fatal, // INVALID_HTML_SYNTAX

    // Template structure errors
    1072: DiagnosticLevel.Fatal, // MISSING_ROOT_TEMPLATE_TAG
    1075: DiagnosticLevel.Fatal, // MULTIPLE_ROOTS_FOUND
    1078: DiagnosticLevel.Fatal, // NO_MATCHING_CLOSING_TAGS
    1079: DiagnosticLevel.Fatal, // ROOT_TAG_SHOULD_BE_TEMPLATE

    // Module resolution errors that should be fatal
    1002: DiagnosticLevel.Fatal, // MODULE_RESOLUTION_ERROR
    1010: DiagnosticLevel.Fatal, // IMPORTEE_RESOLUTION_FAILED
    1011: DiagnosticLevel.Fatal, // IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED
    1004: DiagnosticLevel.Fatal, // NONEXISTENT_FILE

    // Transformer errors that should be fatal
    1005: DiagnosticLevel.Fatal, // NO_AVAILABLE_TRANSFORMER
    1006: DiagnosticLevel.Fatal, // INVALID_SOURCE
    1007: DiagnosticLevel.Fatal, // JS_TRANSFORMER_ERROR
    1008: DiagnosticLevel.Fatal, // HTML_TRANSFORMER_ERROR
    1009: DiagnosticLevel.Fatal, // CSS_TRANSFORMER_ERROR
    1026: DiagnosticLevel.Fatal, // CSS_IN_HTML_ERROR
    1027: DiagnosticLevel.Fatal, // INVALID_ID

    // Compiler validation errors that should be fatal
    1013: DiagnosticLevel.Fatal, // INVALID_COMPAT_PROPERTY
    1014: DiagnosticLevel.Fatal, // INVALID_ENV_ENTRY_VALUE
    1015: DiagnosticLevel.Fatal, // INVALID_ENV_PROPERTY
    1016: DiagnosticLevel.Fatal, // INVALID_FILES_PROPERTY
    1018: DiagnosticLevel.Fatal, // INVALID_NAME_PROPERTY
    1019: DiagnosticLevel.Fatal, // INVALID_NAMESPACE_PROPERTY
    1021: DiagnosticLevel.Fatal, // INVALID_SOURCEMAP_PROPERTY
    1023: DiagnosticLevel.Fatal, // MISSING_OPTIONS_OBJECT
    1024: DiagnosticLevel.Fatal, // UNEXPECTED_FILE_CONTENT
    1025: DiagnosticLevel.Fatal, // UNKNOWN_ENV_ENTRY_KEY
    1028: DiagnosticLevel.Fatal, // OPTIONS_MUST_BE_OBJECT
    1029: DiagnosticLevel.Fatal, // UNKNOWN_IF_MODIFIER
    1030: DiagnosticLevel.Fatal, // UNKNOWN_OPTION_PROPERTY
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

/**
 * Gets all error codes that would be upgraded to Fatal level when strict classification is enabled.
 * Useful for testing and documentation purposes.
 *
 * @returns Array of error codes that get upgraded to Fatal
 */
export function getUpgradedErrorCodes(): number[] {
    return Object.keys(ERROR_LEVEL_OVERRIDES).map(Number);
}

/**
 * Checks if a specific error code would be upgraded to Fatal level when strict classification is enabled.
 *
 * @param errorCode The error code to check
 * @returns True if the error code would be upgraded to Fatal
 */
export function isUpgradedToFatal(errorCode: number): boolean {
    return ERROR_LEVEL_OVERRIDES[errorCode] === DiagnosticLevel.Fatal;
}
