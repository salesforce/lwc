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
    RenderModeDirective,
    Root,
    SourceLocation,
    LWCDirectiveRenderMode,
    PreserveCommentsDirective,
    ParentWrapper,
    ParentNode,
    ChildNode,
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
        current,
        predicate,
        traversalCond = () => true,
    }: {
        current: ParentWrapper;
        predicate: (node: ParentWrapper) => unknown;
        traversalCond?: (nodes: { current: ParentWrapper; parent: ParentWrapper }) => unknown;
    }): ParentNode | null {
        if (predicate(current)) {
            return current.node;
        }

        const parent = current.parent;
        if (parent && traversalCond({ current, parent })) {
            return this.findAncestor({ current: parent, predicate, traversalCond });
        }

        return null;
    }

    appendChildAndCreateParent(child: ParentNode & ChildNode, parent: ParentWrapper) {
        parent.node.children.push(child);
        return this.parentWrapper(child, parent);
    }

    parentWrapper(node: ParentNode, parent: ParentWrapper): ParentWrapper {
        return {
            parent,
            node,
        };
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
