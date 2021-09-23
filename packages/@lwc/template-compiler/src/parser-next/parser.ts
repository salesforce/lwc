/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerDiagnostic,
    CompilerError,
    generateCompilerDiagnostic,
    generateCompilerError,
    Location,
    LWCErrorInfo,
    normalizeToDiagnostic,
} from '@lwc/errors';
import { ResolvedConfig } from '../config';
import {
    LWCNodeType,
    Node,
    NodeContainer,
    ParentNode,
    RenderModeDirective,
    Root,
    SourceLocation,
    LWCDirectiveRenderMode,
    PreserveCommentsDirective,
} from '../shared-next/types';

function normalizeLocation(location?: SourceLocation): Location {
    let line = 0;
    let column = 0;
    let length = 0;
    const start = 0;

    if (location) {
        const { start, end } = location;

        line = location.startLine;
        column = location.startColumn;
        length = end - start;
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
        location: SourceLocation,
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

    throwOnError(errorInfo: LWCErrorInfo, error: any, location?: SourceLocation): never {
        const diagnostic = normalizeToDiagnostic(errorInfo, error, {
            location: normalizeLocation(location),
        });
        throw CompilerError.from(diagnostic);
    }

    throwOnNode(errorInfo: LWCErrorInfo, node: Node, messageArgs?: any[]): never {
        this.throwAtLocation(errorInfo, node.location, messageArgs);
    }

    throwAtLocation(
        errorInfo: LWCErrorInfo,
        location?: SourceLocation,
        messageArgs?: any[]
    ): never {
        throw generateCompilerError(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location),
            },
        });
    }

    warnOnNode(errorInfo: LWCErrorInfo, node: Node, messageArgs?: any[]): void {
        this.warnAtLocation(errorInfo, messageArgs, node.location);
    }

    warnAtLocation(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: SourceLocation): void {
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

    getRootDirective(type: LWCNodeType) {
        return this.root?.directives?.find((directive) => directive.name === type);
    }

    getRenderMode(): LWCDirectiveRenderMode {
        const directive = this.getRootDirective(LWCNodeType.RenderMode) as RenderModeDirective;
        return directive?.value.value ?? LWCDirectiveRenderMode.Shadow;
    }

    getPreserveComments(): boolean {
        const directive = this.getRootDirective(
            LWCNodeType.PreserveComments
        ) as PreserveCommentsDirective;
        return directive?.value.value ?? this.config.preserveHtmlComments;
    }
}
