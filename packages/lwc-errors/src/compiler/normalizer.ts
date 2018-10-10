import { LWCErrorInfo, Location, templateString } from "../shared/utils";
import { CompilerContext, CompilerError } from "./utils";

export function throwError(errorInfo: LWCErrorInfo, args?: any[]): never {
    const message = normalizeErrorMessage(errorInfo, args);
    const filename = "";

    throw new CompilerError(errorInfo.code, message, filename);
}

export function generateCompilerError(
    errorInfo: LWCErrorInfo,
    messageArgs?: any[],
    context?: CompilerContext,
    customErrorConstructor?: Function,
): CompilerError {
    const message = normalizeErrorMessage(errorInfo, messageArgs);

    let customError;
    if (customErrorConstructor) {
        customError = customErrorConstructor(message);
    }

    const filename = getFilename(context || {}, customError);
    const location = getLocation(context || {}, customError);

    return new CompilerError(errorInfo.code, message, filename, location);
}

export function normalizeErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = args ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `Error LWC${errorInfo.code}: ${message}`;
}

export function normalizeCompilerError(error: any, newContext?: CompilerContext): CompilerError {
    if (error instanceof CompilerError) {
        if (newContext) {
            error.filename = newContext.filename;
            error.location = newContext.location;
        }
        return error;
    }

    const code = 0; // errorInfo ? errorInfo.code : 0; // Generic code for compiler errors
    const message = error.message || ''; // generic compiler error message
    const filename = getFilename(newContext || {}, error);
    const location = getLocation(newContext || {}, error);
    // TODO

    const compilerError = new CompilerError(code, message, filename, location);
    return compilerError;
}

function getFilename(context: CompilerContext, error: any): string {
    return context.filename || (error ? error.filename : '');
}

function getLocation(context: CompilerContext, error: any): Location {
    return context.location || getLocationFromError(error);
}

function getLocationFromError(error: any): Location {
    const line = (!error || error.line === null) ? 0 : error.line;
    const column = (!error || error.column === null) ? 0 : error.column;

    return { line, column };
}
