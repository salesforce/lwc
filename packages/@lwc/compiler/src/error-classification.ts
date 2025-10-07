/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Error categories for determining whether compilation should stop or continue
 */
export enum ErrorCategory {
    FATAL = 'fatal', // Must stop compilation
    COLLECTIBLE = 'collectible', // Can continue with errors
}

/**
 * Set of error codes that are considered fatal and must stop compilation.
 * These errors prevent meaningful compilation from proceeding.
 */
export const FATAL_ERROR_CODES = new Set([
    // Generic compilation errors
    1001, // GENERIC_COMPILER_ERROR
    1003, // INVALID_TEMPLATE
    1005, // NO_AVAILABLE_TRANSFORMER
    1006, // INVALID_SOURCE
    // 1007, // JS_TRANSFORMER_ERROR
    1008, // HTML_TRANSFORMER_ERROR
    1009, // CSS_TRANSFORMER_ERROR

    // Parsing errors
    1052, // GENERIC_PARSING_ERROR
    1053, // IDENTIFIER_PARSING_ERROR
    1083, // TEMPLATE_EXPRESSION_PARSING_ERROR

    // Critical structural errors
    1072, // MISSING_ROOT_TEMPLATE_TAG
    1075, // MULTIPLE_ROOTS_FOUND
    1077, // NO_DIRECTIVE_FOUND_ON_TEMPLATE
    1078, // NO_MATCHING_CLOSING_TAGS
    1079, // ROOT_TAG_SHOULD_BE_TEMPLATE

    // Module resolution errors
    1002, // MODULE_RESOLUTION_ERROR
    1004, // NONEXISTENT_FILE
    1010, // IMPORTEE_RESOLUTION_FAILED
    1011, // IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED

    // Configuration errors
    1013, // INVALID_COMPAT_PROPERTY
    1014, // INVALID_ENV_ENTRY_VALUE
    1015, // INVALID_ENV_PROPERTY
    1016, // INVALID_FILES_PROPERTY
    1018, // INVALID_NAME_PROPERTY
    1019, // INVALID_NAMESPACE_PROPERTY
    1021, // INVALID_SOURCEMAP_PROPERTY
    1023, // MISSING_OPTIONS_OBJECT
    1024, // UNEXPECTED_FILE_CONTENT
    1025, // UNKNOWN_ENV_ENTRY_KEY

    // Transformer errors
    1026, // CSS_IN_HTML_ERROR
    1027, // INVALID_ID
    1198, // JS_TRANSFORMER_DECORATOR_ERROR
]);

/**
 * Determines if an error code represents a fatal error that should stop compilation
 * @param errorCode The error code to check
 * @returns true if the error is fatal and should stop compilation
 */
export function isFatalError(errorCode: number): boolean {
    return FATAL_ERROR_CODES.has(errorCode);
}

/**
 * Determines if an error code represents a collectible error that can be collected
 * @param errorCode The error code to check
 * @returns true if the error can be collected instead of stopping compilation
 */
export function isCollectibleError(errorCode: number): boolean {
    return !isFatalError(errorCode);
}

/**
 * Classifies an error code into its category
 * @param errorCode The error code to classify
 * @returns The error category
 */
export function classifyError(errorCode: number): ErrorCategory {
    return isFatalError(errorCode) ? ErrorCategory.FATAL : ErrorCategory.COLLECTIBLE;
}
