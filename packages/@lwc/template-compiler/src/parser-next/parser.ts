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
    ScopeNode,
    ParentNode,
    RenderModeDirective,
    Root,
    SourceLocation,
    LWCDirectiveRenderMode,
    PreserveCommentsDirective,
    ChildNode,
    ForBlock,
    IfBlock,
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

interface RootDirective {
    renderMode: LWCDirectiveRenderMode;
    preserveComments: boolean;
}

export default class ParserCtx {
    private readonly source: String;
    readonly config: ResolvedConfig;

    readonly warnings: CompilerDiagnostic[] = [];
    readonly seenIds: Set<string> = new Set();
    readonly seenSlots: Set<string> = new Set();

    readonly parentStack: ParentNode[] = [];

    // jtu:  come back to this the consequence of this is that the root will always be an empty object
    scope: ScopeNode = {};
    readonly rootDirective: RootDirective;

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
        this.rootDirective = {
            renderMode: LWCDirectiveRenderMode.Shadow,
            preserveComments: this.config.preserveHtmlComments,
        };
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    // jtu: come back to this I think we need to readjust the logic for placing things back in here aka current
    // Check if we're adding the element directly into the nodeCOntainer or waiting for the parent to do it.
    // update:  this needs to go back to the old way of doing it, where you pass in the current to look up
    findAncestor({
        current = this.scope,
        predicate,
        traversalCond = () => true,
    }: {
        current?: ScopeNode;
        predicate: (node: ScopeNode) => unknown;
        traversalCond?: (nodes: { current: ScopeNode; parent: ScopeNode | undefined }) => unknown;
    }): ScopeNode | null {
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

    enterScope(node: ParentNode) {
        this.scope = {
            parent: this.scope,
            node,
        };
    }

    exitScope() {
        if (this.scope.parent) {
            // jtu: come back to this dunno if you actually need to set to undefined
            const parent = this.scope.parent;
            this.scope.parent = undefined;
            this.scope = parent;
        }
    }

    // jtu:  come up with a better name or method for this
    appendChildAndEnterScope(node: ForBlock | IfBlock) {
        this.appendChildNode(node);
        this.enterScope(node);
    }

    appendChildNode(child: ChildNode) {
        this.scope.node?.children.push(child);
    }

    // jtu: come back to this could be cleaner

    setRootDirective(root: Root) {
        const { renderMode, preserveComments } = this.rootDirective;
        if (root.directives) {
            // const renderMode = this.getRootDirective(root, LWCNodeType.RenderMode) as RenderModeDirective;
            // const preserveComment = this.getRootDirective(root, LWCNodeType.PreserveComments) as PreserveCommentsDirective;
            // this.rootDirective.renderMode = renderMode?.value.value ?? this.rootDirective.renderMode;
            // this.rootDirective.preserveComments = preserveComment?.value.value ?? this.rootDirective.preserveComments;
            const rootRenderMode = this.getRootRenderMode(root);
            const rootPreserveComments = this.getRootPreserverComments(root);
            this.rootDirective.renderMode = rootRenderMode?.value ?? renderMode;
            this.rootDirective.preserveComments = rootPreserveComments?.value ?? preserveComments;

            // const rootRenderMode = this.getRootDirective(
            //     root,
            //     LWCNodeType.RenderMode
            // ) as RenderModeDirective;
            // const rootPreserveComments = this.getRootDirective(
            //     root,
            //     LWCNodeType.PreserveComments
            // ) as PreserveCommentsDirective;
            // this.rootDirective.renderMode = rootRenderMode?.value.value ?? renderMode;
            // this.rootDirective.preserveComments =
            //     rootPreserveComments?.value.value ?? preserveComments;
        }
    }

    private getRootRenderMode(root: Root) {
        const renderMode = this.getRootDirective(
            root,
            LWCNodeType.RenderMode
        ) as RenderModeDirective;
        return renderMode?.value;
    }

    private getRootPreserverComments(root: Root) {
        const preserveComments = this.getRootDirective(
            root,
            LWCNodeType.PreserveComments
        ) as PreserveCommentsDirective;
        return preserveComments.value;
    }

    private getRootDirective(root: Root, type: LWCNodeType) {
        return root.directives?.find((dir) => dir.name === type);
    }

    getRenderMode(): LWCDirectiveRenderMode {
        return this.rootDirective.renderMode;
    }

    getPreserveComments(): boolean {
        return !!this.rootDirective.preserveComments;
    }
}
