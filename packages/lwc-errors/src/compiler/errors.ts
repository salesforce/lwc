import { templateString } from "../shared/utils";
import { Location, LWCErrorInfo } from "../shared/types";
import { CompilerContext, CompilerError } from "./utils";

export * from "./error-info/lwc-class";
export * from "./error-info/compiler";
export * from "./error-info/jest-transformer";
export * from "./error-info/style-transform";
export * from "./error-info/template-transform";

export * from "./utils";

export interface ErrorConfig {
    messageArgs?: any[];
    context?: CompilerContext;
    errorConstructor?: (message: string) => Error;
}

// TODO ERROR CODES: Move somewhere else
const GENERIC_COMPILER_ERROR = {
    code: 0,
};

/**
 * Generates a compiler error. This function is used to look up the specified errorInfo
 * and generate a friendly and consistent error object from that info.
 *
 * @param {LWCErrorInfo} errorInfo The object holding the error metadata.
 * @param {Array} messageArgs Any arguments needed to construct the error message
 * @param {CompilerContext} context Provides explicit context on where (file name, Location) the error happened
 * @param {(message: string) => Error} customErrorConstructor Hook for creating an intermediate error object before generating
 * the final CompilerError. Expects a pre-formatted error message string and returns an Error object. This is often useful for
 * getting extra error data from library errors while still passing a correctly formatted error message to the library.
 * @return {CompilerError}
 */
export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig
): CompilerError {
    const message = normalizeErrorMessage(errorInfo, config && config.messageArgs);
    const customError = config && config.errorConstructor && config.errorConstructor(message);

    return new CompilerError(
        errorInfo.code,
        customError ? customError.message : message,
        getFilename(config && config.context || {}, customError),
        getLocation(config && config.context || {}, customError)
    );
}

/**
 * Normalizes a received error with additional context and converts it into a CompilerError if necessary
 * @param error
 * @param newContext
 *
 * @return {CompilerError}
 */
export function normalizeCompilerError(error: any, newContext?: CompilerContext): CompilerError {
    if (error instanceof CompilerError) {
        if (newContext) {
            if (newContext.filename) {
                error.filename = newContext.filename;
            }

            if (newContext.location) {
                error.location = newContext.location;
            }
        }
        return error;
    }

    const compilerError = new CompilerError(
        GENERIC_COMPILER_ERROR.code,
        error.message,
        getFilename(newContext, error),
        getLocation(newContext, error)
    );

    compilerError.stack = error.stack;
    return compilerError;
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throw generateCompilerError(errorInfo, {
            messageArgs: args
        });
    }
}

function normalizeErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = Array.isArray(args) ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `Error LWC${errorInfo.code}: ${message}`;
}

function getFilename(context: CompilerContext | undefined, error: any): string {
    // Give priority to explicit context
    if (context && context.filename) {
        return context.filename;
    } else if (error) {
        return error.filename || error.fileName || error.file;
    }
    return '';
}

function getLocation(context: CompilerContext | undefined, error: any): Location | undefined {
    // Give priority to explicit context
    if (context && context.location) {
        return context.location;
    }
    return getLocationFromError(error);
}

function getLocationFromError(error: any): Location | undefined {
    if (error) {
        if (error.location) {
            return error.location;
        } else if (error.loc) {
            return error.loc;
        } else if (error.line && error.column) {
            return { line: error.line, column: error.column };
        }
    }

    return undefined;
}
