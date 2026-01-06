/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { templateString } from '../shared/utils';
import { CompilerError, getCodeFromError, getFilename, getLocation } from './utils';
import type { DiagnosticLevel, LWCErrorInfo } from '../shared/types';
import type { CompilerDiagnosticOrigin, CompilerDiagnostic } from './utils';

export { CompilerDiagnosticOrigin, CompilerDiagnostic, CompilerError } from './utils';

export * from './error-info';

// TODO [#1289]: Can be flattened now that we're down to only 2 properties
export interface ErrorConfig {
    messageArgs?: any[];
    origin?: CompilerDiagnosticOrigin;
}

/**
 * Generates a friendly error message for the given error type, using the provided template values.
 * @param errorInfo The object holding the error metadata.
 * @param args Values used to fill the error message template.
 * @returns The generated error message.
 */
export function generateErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = Array.isArray(args)
        ? templateString(errorInfo.message, args)
        : errorInfo.message;

    if (errorInfo.url && errorInfo.url !== '') {
        // TODO [#1289]: Add url info into message
    }

    return `LWC${errorInfo.code}: ${message}`;
}

/**
 * Generates a compiler diagnostic. This function is used to look up the specified errorInfo
 * and generate a friendly and consistent diagnostic object. Diagnostic contains
 * info about the error's code and its origin (filename, line, column) when applicable.
 * @param errorInfo The object holding the error metadata.
 * @param config A config object providing any message arguments and origin info needed to create the error.
 * @returns The generated compiler diagnostic object.
 */
export function generateCompilerDiagnostic(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig,
    useStrictErrorOverride = false
): CompilerDiagnostic {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);

    const diagnostic: CompilerDiagnostic = {
        code: errorInfo.code,
        message,
        level: getEffectiveErrorLevel(errorInfo, useStrictErrorOverride),
        url: errorInfo.url,
    };

    if (config && config.origin) {
        diagnostic.filename = getFilename(config.origin);
        diagnostic.location = getLocation(config.origin);
    }

    return diagnostic;
}

/**
 * Generates a compiler error. This function is used to look up the specified errorInfo
 * and generate a friendly and consistent error object. Error object contains info about
 * the error's code and its origin (filename, line, column) when applicable.
 * @param errorInfo The object holding the error metadata.
 * @param config A config object providing any message arguments and origin info needed to create the error.
 * @returns The generated compiler error.
 */
export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig,
    useStrictErrorOverride = false
): CompilerError {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);
    const level = getEffectiveErrorLevel(errorInfo, useStrictErrorOverride);
    const error = new CompilerError(
        errorInfo.code,
        message,
        undefined,
        undefined,
        level,
        errorInfo.url
    );

    if (config) {
        error.filename = getFilename(config.origin);
        error.location = getLocation(config.origin);
    }

    return error;
}

/**
 * Validates that the provided condition is truthy.
 * @param condition Condition to check.
 * @param errorInfo The object holding the error metadata.
 * @param args Values used to fill the error message template.
 * @throws Throws a compiler error if the provided condition is falsy.
 */
export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throw generateCompilerError(errorInfo, {
            messageArgs: args,
        });
    }
}

/**
 * Normalizes a received error into a CompilerError. Adds any provided additional origin info.
 * @param errorInfo The object holding the error metadata.
 * @param error The original error.
 * @param origin The origin associated with the error.
 * @returns The normalized compiler error.
 */
export function normalizeToCompilerError(
    fallbackErrorInfo: LWCErrorInfo,
    error: any,
    origin?: CompilerDiagnosticOrigin,
    useStrictErrorOverride = false
): CompilerError {
    if (error instanceof CompilerError) {
        if (origin) {
            error.filename = getFilename(origin);
            error.location = getLocation(origin);
        }
        return error;
    }
    const { code, message, filename, location, level, url } = convertErrorToDiagnostic(
        error,
        fallbackErrorInfo,
        origin,
        useStrictErrorOverride
    );

    const compilerError = new CompilerError(
        code,
        `${error.name}: ${message}`,
        filename,
        location,
        level,
        url
    );
    compilerError.stack = error.stack;
    return compilerError;
}

/**
 * Determines the effective error level based on strict mode override settings.
 * @param errorInfo The error information containing level and strictLevel properties
 * @param useStrictErrorOverride Whether to use strict error level override
 * @returns The effective diagnostic level to use
 */
function getEffectiveErrorLevel(
    errorInfo: LWCErrorInfo,
    useStrictErrorOverride: boolean
): DiagnosticLevel {
    return useStrictErrorOverride && errorInfo.strictLevel !== undefined
        ? errorInfo.strictLevel
        : errorInfo.level;
}

/**
 * Normalizes a received error into a CompilerDiagnostic. Adds any provided additional origin info.
 * @param errorInfo The object holding the error metadata.
 * @param error The original error.
 * @param origin The origin of the error.
 * @returns The normalized compiler diagnostic object.
 */
export function normalizeToDiagnostic(
    errorInfo: LWCErrorInfo,
    error: any,
    origin?: CompilerDiagnosticOrigin,
    useStrictErrorOverride = false
): CompilerDiagnostic {
    if (error instanceof CompilerError) {
        const diagnostic = error.toDiagnostic();
        if (origin) {
            diagnostic.filename = getFilename(origin);
            diagnostic.location = getLocation(origin);
        }
        return diagnostic;
    }

    return convertErrorToDiagnostic(error, errorInfo, origin, useStrictErrorOverride);
}

function convertErrorToDiagnostic(
    error: any,
    fallbackErrorInfo: LWCErrorInfo,
    origin?: CompilerDiagnosticOrigin,
    useStrictErrorOverride = false
): CompilerDiagnostic {
    const code = getCodeFromError(error) || fallbackErrorInfo.code;
    const message = error.lwcCode
        ? error.message
        : generateErrorMessage(fallbackErrorInfo, [error.message]);

    const level = getEffectiveErrorLevel(
        'level' in error ? error : fallbackErrorInfo,
        useStrictErrorOverride
    );
    const url = error.url ?? fallbackErrorInfo.url;
    const filename = getFilename(origin, error);
    const location = getLocation(origin, error);

    // TODO [#1289]: Preserve stack information
    return { code, message, level, filename, location, url };
}
