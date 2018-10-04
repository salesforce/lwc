import { templateString, LWCErrorInfo } from "../shared/utils";
import { Location } from "../diagnostics/diagnostic";

export class CompilerError extends Error {
    public filename?: string;
    public location?: { line: number, column: number };

    constructor(message: string, filename?: string, location?: { line: number, column: number }) {
        super(message);

        this.filename = filename;
        this.location = location;
    }
}

export function normalizeErrorMessage(error: LWCErrorInfo, args?: any[]): string {
    const message = args ? templateString(error.message, args) : error.message;
    return `LWC${error.code}: ${message}`;
}

export function invariant(condition: boolean, error: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throwError(error.type, normalizeErrorMessage(error, args), '');
    }
}

function throwError(type: String, message: string, fileName?: string, location?: Location) {
    switch (type) {
        case "TypeError":
            throw new TypeError(message);
        default:
            throw new CompilerError(message, fileName, location);
    }
}
