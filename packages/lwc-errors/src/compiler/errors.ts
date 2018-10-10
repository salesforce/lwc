import { LWCErrorInfo, templateString } from "../shared/utils";
import { CompilerContext, CompilerError, Location } from "./utils";

export * from "./error-info/babel-plugin-lwc-class";
export * from "./error-info/compiler";
export * from "./error-info/jest-transformer";
export * from "./error-info/styles-transformer";
export * from "./error-info/template-compiler";

export * from "./utils";

// TODO ERROR CODES: Move somewhere else
const GENERIC_COMPILER_ERROR = {
    code: 0,
};

export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    messageArgs?: any[],
    context?: CompilerContext,
    customErrorConstructor?: (message: string) => Error,
): CompilerError {
    const message = normalizeErrorMessage(errorInfo, messageArgs);
    const customError = customErrorConstructor && customErrorConstructor(message);

    const fullMessage = customError ? customError.message : message;

    const filename = getFilename(context || {}, customError);
    const location = getLocation(context || {}, customError);

    return new CompilerError(errorInfo.code, fullMessage, filename, location);
}

export function normalizeCompilerError(error: any, newContext?: CompilerContext): CompilerError {
    if (error instanceof CompilerError) {
        if (newContext) {
            error.filename = newContext.filename;
            error.location = newContext.location;
        }
        return error;
    }

    const code = GENERIC_COMPILER_ERROR.code;
    const message = error.message;
    const filename = getFilename(newContext || {}, error);
    const location = getLocation(newContext || {}, error);
    const compilerError = new CompilerError(code, message, filename, location);

    // Move stack over?
    compilerError.stack = error.stack;
    return compilerError;
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throw generateCompilerError(errorInfo, args);
    }
}

function normalizeErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = args ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `Error LWC${errorInfo.code}: ${message}`;
}

function getFilename(context: CompilerContext, error: any): string {
    // Give priority to explicit context
    return context.filename || (error ? error.filename || error.file : '');
}

function getLocation(context: CompilerContext, error: any): Location {
    // Give priority to explicit context
    return context.location || getLocationFromError(error);
}

function getLocationFromError(error: any): Location {
    if (error) {
        if (error.location) {
            return error.location;
        } else if (error.line && error.column) {
            return { line: error.line, column: error.column };
        }
    }

    return { line: 0, column: 0};
}
