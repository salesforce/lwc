import { LWCErrorInfo, Location, templateString } from "../shared/utils";
import { CompilerError } from "./utils";

export function throwError(errorInfo: LWCErrorInfo, args?: any[]): never {
    const message = normalizeErrorMessage(errorInfo, args);
    const filename = "";

    throw new CompilerError(errorInfo.code, message, filename);
}

export function normalizeErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = args ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `Error LWC${errorInfo.code}: ${message}`;
}

export function normalizeCompilerError(error: any, errorInfo?: LWCErrorInfo): CompilerError {
    const code = errorInfo ? errorInfo.code : 0; // Generic code for compiler errors
    const message = error.message || ''; // generic compiler error message
    const filename = error.filename;

    const location = getErrorLocation(error);
    // TODO

    return new CompilerError(code, message, filename, location);
}

function getErrorLocation(error: any): Location {
    const line = (error.line === null) ? 0 : error.line;
    const column = (error.column === null) ? 0 : error.column;

    return { line, column };
}
