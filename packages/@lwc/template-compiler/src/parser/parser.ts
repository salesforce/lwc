/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
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
import { IRElement, LWCDirectiveRenderMode, IRBaseAttribute, IRNode } from '../shared/types';
import { ResolvedConfig } from '../config';

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
    readonly seenSlots: Set<string> = new Set();

    readonly parentStack: IRElement[] = [];

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    *ancestors(element?: IRElement) {
        const ancestors = element ? [...this.parentStack, element] : this.parentStack;
        for (let index = ancestors.length - 1; index > 0; index--) {
            yield { current: ancestors[index], index };
        }
    }

    findAncestor(args: {
        element?: IRElement;
        predicate: (elm: IRElement) => unknown;
        traversalCond?: (nodes: { current: IRElement; parent: IRElement | null }) => unknown;
    }): IRElement | null {
        const { element, predicate, traversalCond = () => true } = args;
        for (const { current, index } of this.ancestors(element)) {
            if (predicate(current)) {
                return current;
            }
            if (!traversalCond({ current, parent: this.parentStack[index - 1] })) {
                break;
            }
        }
        return null;
    }

    /**
     * This method recovers from diagnostic errors that are encountered when fn is invoked.
     * All other errors are considered compiler errors and can not be recovered from.
     *
     * @param fn - method to be invoked.
     */
    withErrorRecovery<T>(fn: () => T): T | undefined {
        try {
            return fn();
        } catch (error) {
            if (error instanceof CompilerError) {
                // Diagnostic error
                this.addDiagnostic(error.toDiagnostic());
            } else {
                // Compiler error
                throw error;
            }
        }
    }

    withErrorWrapping<T>(
        fn: () => T,
        errorInfo: LWCErrorInfo,
        location: parse5.Location,
        msgFormatter?: (error: any) => string
    ): T {
        try {
            return fn();
        } catch (error: any) {
            if (msgFormatter) {
                error.message = msgFormatter(error);
            }
            this.throwOnError(errorInfo, error, location);
        }
    }

    throwOnError(errorInfo: LWCErrorInfo, error: any, location?: parse5.Location): never {
        const diagnostic = normalizeToDiagnostic(errorInfo, error, {
            location: normalizeLocation(location),
        });
        throw CompilerError.from(diagnostic);
    }

    /**
     * This method throws a diagnostic error with the IRNode's location.
     */
    throwOnIRNode(
        errorInfo: LWCErrorInfo,
        irNode: IRNode | IRBaseAttribute,
        messageArgs?: any[]
    ): never {
        this.throw(errorInfo, messageArgs, irNode.location);
    }

    /**
     * This method throws a diagnostic error with location information.
     */
    throwAtLocation(
        errorInfo: LWCErrorInfo,
        location: parse5.Location,
        messageArgs?: any[]
    ): never {
        this.throw(errorInfo, messageArgs, location);
    }

    /**
     * This method throws a diagnostic error and will immediately exit the current routine.
     */
    throw(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: parse5.Location): never {
        throw generateCompilerError(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location),
            },
        });
    }

    /**
     * This method logs a diagnostic warning with the IRNode's location.
     */
    warnOnIRNode(
        errorInfo: LWCErrorInfo,
        irNode: IRNode | IRBaseAttribute,
        messageArgs?: any[]
    ): void {
        this.warn(errorInfo, messageArgs, irNode.location);
    }

    /**
     * This method logs a diagnostic warning with location information.
     */
    warnAtLocation(errorInfo: LWCErrorInfo, location: parse5.Location, messageArgs?: any[]): void {
        this.warn(errorInfo, messageArgs, location);
    }

    /**
     * This method logs a diagnostic warning and will continue execution of the current routine.
     */
    warn(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: parse5.Location): void {
        this.addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: normalizeLocation(location),
                },
            })
        );
    }

    private addDiagnostic(diagnostic: CompilerDiagnostic): void {
        this.warnings.push(diagnostic);
    }

    getRoot(element: IRElement): IRElement {
        return this.parentStack[0] || element;
    }

    getRenderMode(element: IRElement): LWCDirectiveRenderMode {
        return this.getRoot(element).lwc?.renderMode ?? LWCDirectiveRenderMode.shadow;
    }

    getPreserveComments(element: IRElement): boolean {
        return (
            this.getRoot(element).lwc?.preserveComments?.value ?? this.config.preserveHtmlComments
        );
    }
}
