/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { templateString } from '../shared/utils';
import { LWCErrorInfo } from '../shared/types';
import {
    CompilerDiagnosticOrigin,
    CompilerDiagnostic,
    CompilerError,
    getCodeFromError,
    getFilename,
    getLocation,
} from './utils';

export { CompilerDiagnosticOrigin, CompilerDiagnostic, CompilerError } from './utils';

export * from './error-info';

// TODO [#1289]: Can be flattened now that we're down to only 2 properties
export interface ErrorConfig {
    messageArgs?: any[];
    origin?: CompilerDiagnosticOrigin;
}

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
 *
 * @param {LWCErrorInfo} errorInfo The object holding the error metadata.
 * @param {ErrorConfig} config A config object providing any message arguments and origin info needed to create the error.
 * @return {CompilerDiagnostic}
 */
export function generateCompilerDiagnostic(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig
): CompilerDiagnostic {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);
    const diagnostic: CompilerDiagnostic = {
        code: errorInfo.code,
        message,
        level: errorInfo.level,
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
 *
 * @param {LWCErrorInfo} errorInfo The object holding the error metadata.
 * @param {ErrorConfig} config A config object providing any message arguments and origin info needed to create the error.
 * @return {CompilerError}
 */
export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig
): CompilerError {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);
    const error = new CompilerError(errorInfo.code, message);

    if (config) {
        error.filename = getFilename(config.origin);
        error.location = getLocation(config.origin);
    }

    return error;
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throw generateCompilerError(errorInfo, {
            messageArgs: args,
        });
    }
}

/**
 * Normalizes a received error into a CompilerError. Adds any provided additional origin info.
 * @param errorInfo
 * @param error
 * @param origin
 *
 * @return {CompilerError}
 */
export function normalizeToCompilerError(
    errorInfo: LWCErrorInfo,
    error: any,
    origin?: CompilerDiagnosticOrigin
): CompilerError {
    if (error instanceof CompilerError) {
        if (origin) {
            error.filename = getFilename(origin);
            error.location = getLocation(origin);
        }
        return error;
    }

    const { code, message, filename, location } = convertErrorToDiagnostic(
        error,
        errorInfo,
        origin
    );

    const compilerError = new CompilerError(code, `${error.name}: ${message}`, filename, location);
    compilerError.stack = error.stack;
    return compilerError;
}

/**
 * Normalizes a received error into a CompilerDiagnostic. Adds any provided additional origin info.
 * @param error
 * @param origin
 *
 * @return {CompilerDiagnostic}
 */
export function normalizeToDiagnostic(
    errorInfo: LWCErrorInfo,
    error: any,
    origin?: CompilerDiagnosticOrigin
): CompilerDiagnostic {
    if (error instanceof CompilerError) {
        const diagnostic = error.toDiagnostic();
        if (origin) {
            diagnostic.filename = getFilename(origin);
            diagnostic.location = getLocation(origin);
        }
        return diagnostic;
    }

    return convertErrorToDiagnostic(error, errorInfo, origin);
}

function convertErrorToDiagnostic(
    error: any,
    fallbackErrorInfo: LWCErrorInfo,
    origin?: CompilerDiagnosticOrigin
): CompilerDiagnostic {
    const code = getCodeFromError(error) || fallbackErrorInfo.code;
    const message = error.lwcCode
        ? error.message
        : generateErrorMessage(fallbackErrorInfo, [error.message]);

    const level = error.level || fallbackErrorInfo.level;
    const filename = getFilename(origin, error);
    const location = getLocation(origin, error);

    // TODO [#1289]: Preserve stack information
    return { code, message, level, filename, location };
}
