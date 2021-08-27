import * as parse5 from 'parse5';
import {
    CompilerDiagnostic,
    CompilerError,
    generateCompilerDiagnostic,
    generateCompilerError,
    Location,
    LWCErrorInfo,
    normalizeToDiagnostic,
} from '@lwc/errors';
import { IRElement } from '../shared/types';

import { ResolvedConfig } from '../config';

import { IRBaseAttribute, IRNode } from '../shared/types';

function normalizeLocation(location?: parse5.Location): Location {
    let line = 0;
    let column = 0;
    let start = 0;
    let length = 0;

    if (location) {
        const { startOffset, endOffset } = location;

        line = location.startLine;
        column = location.startCol;
        start = startOffset;
        length = endOffset - startOffset;
    }

    return { line, column, start, length };
}

export default class ParserCtx {
    private readonly source: String;
    readonly config: ResolvedConfig;

    readonly warnings: CompilerDiagnostic[] = [];
    readonly seenIds: Set<string> = new Set();

    readonly parentStack: IRElement[] = [];

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    callWithTC<T extends (...args: any[]) => any>(
        fn: T,
        args: Parameters<T>,
        errorInfo?: LWCErrorInfo,
        location?: parse5.Location
    ): ReturnType<T> | undefined {
        try {
            return fn(...args);
        } catch (error) {
            if (errorInfo) {
                this.throwOnError(errorInfo, error, location);
            } else if (error instanceof CompilerError) {
                this.addDiagnostic(error.toDiagnostic());
            } else {
                throw error;
            }
        }
    }

    warnOnIRNode(
        errorInfo: LWCErrorInfo,
        irNode: IRNode | IRBaseAttribute,
        messageArgs?: any[]
    ): void {
        this.warnAtLocation(errorInfo, messageArgs, irNode.location);
    }

    warnAtLocation(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: parse5.Location): void {
        this.addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: normalizeLocation(location),
                },
            })
        );
    }

    throwOnError(errorInfo: LWCErrorInfo, error: any, location?: parse5.Location): never {
        const diagnostic = normalizeToDiagnostic(errorInfo, error, {
            location: normalizeLocation(location),
        });
        throw CompilerError.from(diagnostic);
    }

    throwOnIRNode(
        errorInfo: LWCErrorInfo,
        irNode: IRNode | IRBaseAttribute,
        messageArgs?: any[]
    ): never {
        this.throwAtLocation(errorInfo, irNode.location, messageArgs);
    }

    throwAtLocation(
        errorInfo: LWCErrorInfo,
        location?: parse5.Location,
        messageArgs?: any[]
    ): never {
        throw generateCompilerError(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location),
            },
        });
    }

    addDiagnostic(diagnostic: CompilerDiagnostic): void {
        this.warnings.push(diagnostic);
    }
}
