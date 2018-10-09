import { LWCErrorInfo } from "../shared/utils";
// TODO: Remove circular dependency
import { throwError } from "./normalizer";

export interface CompilerDiagnostic {
    message: string;
    code: number;
    filename?: string;
    location?: { line: number, column: number };
}

export interface CompilerWarnings {
    [index: number]: CompilerDiagnostic;
}

export class CompilerError extends Error implements CompilerDiagnostic {
    public code: number;
    public filename?: string;
    public location?: { line: number, column: number };

    constructor(code: number, message: string, filename?: string, location?: { line: number, column: number }) {
        super(message);

        this.code = code;
        this.filename = filename;
        this.location = location;
    }
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throwError(errorInfo, args);
    }
}

/*function throwError(type: String | undefined, message: string, fileName?: string, location?: Location) {
    switch (type) {
        case "TypeError":
            throw new TypeError(message);
        default:
            throw new CompilerError(message, fileName, location);
    }
}*/
