import { templateString, LWCErrorInfo, Location } from "../shared/utils";

export class CompilerError extends Error {
    public filename?: string;
    public location?: { line: number, column: number };

    constructor(message: string, filename?: string, location?: { line: number, column: number }) {
        super(message);

        this.filename = filename;
        this.location = location;
    }
}

export function normalizeErrorMessage(errorInfo: LWCErrorInfo, args?: any[]): string {
    const message = args ? templateString(errorInfo.message, args) : errorInfo.message;

    if (errorInfo.url !== "") {
        // TODO: Add url info into message
    }

    return `Error LWC${errorInfo.code}: ${message}`;
}

export function invariant(condition: boolean, errorInfo: LWCErrorInfo, args?: any[]) {
    if (!condition) {
        throwError(errorInfo.type, normalizeErrorMessage(errorInfo, args), '');
    }
}

function throwError(type: String | undefined, message: string, fileName?: string, location?: Location) {
    switch (type) {
        case "TypeError":
            throw new TypeError(message);
        default:
            throw new CompilerError(message, fileName, location);
    }
}
