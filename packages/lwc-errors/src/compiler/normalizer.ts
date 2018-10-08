import { LWCErrorInfo, Location } from "../shared/utils";
import { CompilerError } from "./utils";

export function normalizeCompilerError(error: any, errorInfo?: LWCErrorInfo): CompilerError {
    const message = error.message || ''; // generic compiler error message
    const filename = error.filename;

    const location = getErrorLocation(error, errorInfo);
    // TODO

    return new CompilerError(message, filename, location);
}

function getErrorLocation(error: any, errorInfo?: LWCErrorInfo): Location {
    const line = (error.line === null) ? 0 : error.line;
    const column = (error.column === null) ? 0 : error.column;

    return { line, column };
}
