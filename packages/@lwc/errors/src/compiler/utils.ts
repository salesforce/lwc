/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Location, DiagnosticLevel } from '../shared/types';

export interface CompilerDiagnosticOrigin {
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

    static from(diagnostic: CompilerDiagnostic, origin?: CompilerDiagnosticOrigin) {
        const { code, message } = diagnostic;

        const filename = getFilename(origin, diagnostic);
        const location = getLocation(origin, diagnostic);

        const compilerError = new CompilerError(code, message, filename, location);

        // The stack here is misleading and doesn't point to the cause of the original error message
        // TODO [W-5712064]: Enhance diagnostics with useful stack trace and source code
        compilerError.stack = undefined;
        return compilerError;
    }

    toDiagnostic(): CompilerDiagnostic {
        return {
            code: this.code,
            message: this.message,
            level: this.level,
            filename: this.filename,
            location: this.location,
        };
    }
}

/**
 * Extracts an error code from the given error.
 * @param error The error to check.
 * @returns The error code, if found.
 */
export function getCodeFromError(error: any): number | undefined {
    if (error.lwcCode && typeof error.lwcCode === 'number') {
        return error.lwcCode;
    } else if (error.code && typeof error.code === 'number') {
        return error.code;
    }
    return undefined;
}

/**
 * Extracts the filename from the provided parameters, preferring to use the compiler diagnostic
 * origin, if provided.
 * @param origin Compiler diagnositic origin data
 * @param obj Any object that might have a filename associated
 * @returns The filename, if found.
 */
export function getFilename(
    origin: CompilerDiagnosticOrigin | undefined,
    obj?: any
): string | undefined {
    // Give priority to explicit origin
    if (origin && origin.filename) {
        return origin.filename;
    } else if (obj) {
        return obj.filename || obj.fileName || obj.file;
    }
    return undefined;
}

/**
 * Extracts the location from the provided parameters, preferring to use the compiler diagnostic
 * origin, if provided.
 * @param origin Compiler diagnositic origin data
 * @param obj Any object that might have a location property
 * @returns The location, if found.
 */
export function getLocation(
    origin: CompilerDiagnosticOrigin | undefined,
    obj?: any
): Location | undefined {
    // Give priority to explicit origin
    if (origin && origin.location) {
        return origin.location;
    }
    return getLocationFromObject(obj);
}

function getLocationFromObject(obj: any): Location | undefined {
    if (obj) {
        if (obj.location) {
            return obj.location;
        } else if (obj.loc) {
            return obj.loc;
        } else if (Number.isInteger(obj.line) && Number.isInteger(obj.column)) {
            return { line: obj.line, column: obj.column, start: obj.start, length: obj.length };
        }
    }

    return undefined;
}
