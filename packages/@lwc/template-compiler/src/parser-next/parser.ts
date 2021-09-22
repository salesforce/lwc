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
import { NodeContainer, ParentNode, Root } from '../shared-next/types';

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

    readonly parentStack: ParentNode[] = [];
    root?: Root;
    nodeContainer: NodeContainer = {};

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    findAncestor({
        current = this.nodeContainer,
        predicate,
        traversalCond = () => true,
    }: {
        current?: NodeContainer;
        predicate: (node: NodeContainer) => unknown;
        traversalCond?: (nodes: {
            current: NodeContainer;
            parent: NodeContainer | undefined;
        }) => unknown;
    }): NodeContainer | null {
        if (current && predicate(current)) {
            return current;
        }

        if (traversalCond({ current, parent: current.parent })) {
            return this.findAncestor({ current: current.parent, predicate, traversalCond });
        }

        return null;
    }

    withErrorRecovery<T>(fn: () => T): T | undefined {
        try {
            return fn();
        } catch (error) {
            if (error instanceof CompilerError) {
                this.addDiagnostic(error.toDiagnostic());
            } else {
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
