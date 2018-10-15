import { Location } from "../shared/types";

export interface CompilerContext {
    filename?: string;
    location?: Location;
}

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
    public location?: Location;

    constructor(code: number, message: string, filename?: string, location?: Location) {
        super(message);

        this.code = code;
        this.filename = filename;
        this.location = location;
    }
}
