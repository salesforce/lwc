import { templateString } from "../shared/utils";
import { Location, LWCErrorInfo, Level } from "../shared/types";
import { CompilerContext, CompilerDiagnostic, CompilerError } from "./utils";

export * from "./error-info/lwc-class";
export * from "./error-info/compiler";
export * from "./error-info/jest-transformer";
export * from "./error-info/style-transform";
export * from "./error-info/template-transform";

export * from "./utils";

// TODO: Can be flattened now that we're down to only 2 properties
export interface ErrorConfig {
    messageArgs?: any[];
    context?: CompilerContext;
}

// TODO ERROR CODES: Move somewhere else
const GENERIC_COMPILER_ERROR = {
    code: 1,
    message: "Unexpected compilation error: {0}",
    level: Level.Error
};

export function generateErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = Array.isArray(args) ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `LWC${errorInfo.code}: ${message}`;
}

export function generateCompilerDiagnostic(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig
): CompilerDiagnostic {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);
    const diagnostic: CompilerDiagnostic = {
        code: errorInfo.code,
        message,
        level: errorInfo.level
    };

    if (config && config.context) {
        diagnostic.filename = config.context.filename;
        diagnostic.location = config.context.location;
    }

    return diagnostic;
}

/**
 * Generates a compiler error. This function is used to look up the specified errorInfo
 * and generate a friendly and consistent error object from that info.
 *
 * @param {LWCErrorInfo} errorInfo The object holding the error metadata.
 * @param {ErrorConfig} config A config object providing any message arguments or context needed to create the error
 * @return {CompilerError}
 */
export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    config?: ErrorConfig
): CompilerError {
    const message = generateErrorMessage(errorInfo, config && config.messageArgs);
    const error = new CompilerError(errorInfo.code, message);

    if (config && config.context) {
        error.filename = config.context.filename;
        error.location = config.context.location;
    }

    return error;
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throw generateCompilerError(errorInfo, {
            messageArgs: args
        });
    }
}

/**
 * Normalizes a received error with additional context and converts it into a CompilerError if necessary
 * @param error
 * @param newContext
 *
 * @return {CompilerError}
 */
export function normalizeToCompilerError(error: any, newContext?: CompilerContext): CompilerError {
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

    const { code, message, filename, location } =
        convertErrorToDiagnostic(error, newContext);

    const compilerError = new CompilerError(
        code,
        message,
        filename,
        location
    );
    compilerError.stack = error.stack;
    return compilerError;
}

export function normalizeToDiagnostic(error: any, newContext?: CompilerContext): CompilerDiagnostic {
    if (error instanceof CompilerError) {
        const diagnostic = error.toDiagnostic();
        if (newContext) {
            if (newContext.filename) {
                diagnostic.filename = newContext.filename;
            }

            if (newContext.location) {
                diagnostic.location = newContext.location;
            }
        }
        return diagnostic;
    }

    return convertErrorToDiagnostic(error, newContext);
}

export function convertDiagnosticToCompilerError(diagnostic: CompilerDiagnostic, newContext?: CompilerContext): CompilerError {
    const { code, message } = diagnostic;

    const filename = getFilename(newContext, diagnostic);
    const location = getLocation(newContext, diagnostic);

    return new CompilerError(code, `${filename}: ${message}`, filename, location);
}

function convertErrorToDiagnostic(error: any, newContext?: CompilerContext): CompilerDiagnostic {
    const code = getCode(error) || GENERIC_COMPILER_ERROR.code;
    const message = error.lwcCode
        ? error.message
        : generateErrorMessage(GENERIC_COMPILER_ERROR, [error.message]);

    const level = error.level || Level.Error;
    const filename = getFilename(newContext, error);
    const location = getLocation(newContext, error);

    return { code, message, level, filename, location };
}

function getCode(error: any): number | undefined {
    if (error.lwcCode && typeof error.lwcCode === 'number') {
        return error.lwcCode;
    } else if (error.code && typeof error.code === 'number') {
        return error.code;
    }
    return undefined;
}

function getFilename(context: CompilerContext | undefined, obj: any): string {
    // Give priority to explicit context
    if (context && context.filename) {
        return context.filename;
    } else if (obj) {
        return obj.filename || obj.fileName || obj.file;
    }
    return '';
}

function getLocation(context: CompilerContext | undefined, obj: any): Location | undefined {
    // Give priority to explicit context
    if (context && context.location) {
        return context.location;
    }
    return getLocationFromObject(obj);
}

function getLocationFromObject(obj: any): Location | undefined {
    if (obj) {
        if (obj.location) {
            return obj.location;
        } else if (obj.loc) {
            return obj.loc;
        } else if (obj.line && obj.column) {
            return { line: obj.line, column: obj.column };
        }
    }

    return undefined;
}
