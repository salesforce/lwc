import { Location, DiagnosticLevel } from "../shared/types";

export interface CompilerContext {
    filename?: string;
    location?: Location;
}

export interface CompilerDiagnostic {
    message: string;
    code: number;
    filename?: string;
    location?: Location;
    level: DiagnosticLevel;
}

export class CompilerError extends Error implements CompilerDiagnostic {
    public code: number;
    public filename?: string;
    public location?: Location;
    public level = DiagnosticLevel.Error;

    constructor(code: number, message: string, filename?: string, location?: Location) {
        super(message);

        this.code = code;
        this.filename = filename;
        this.location = location;
    }

    toDiagnostic(): CompilerDiagnostic {
        return {
            code: this.code,
            message: this.message,
            level: this.level,
            filename: this.filename,
            location: this.location
        };
    }
}
