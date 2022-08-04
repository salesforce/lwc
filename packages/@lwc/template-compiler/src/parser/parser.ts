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
import { NormalizedConfig } from '../config';
import { isIfBlock, isPreserveCommentsDirective, isRenderModeDirective } from '../shared/ast';

import {
    Root,
    SourceLocation,
    ParentNode,
    BaseNode,
    LWCDirectiveRenderMode,
    IfBlock,
} from '../shared/types';

function normalizeLocation(location?: SourceLocation): Location {
    let line = 0;
    let column = 0;
    let length = 0;
    let start = 0;

    if (location) {
        line = location.startLine;
        column = location.startColumn;
        length = location.end - location.start;
        start = location.start;
    }

    return { line, column, start, length };
}

interface ParentWrapper {
    parent: ParentNode | null;
    current: ParentNode;
}

export default class ParserCtx {
    private readonly source: String;

    readonly config: NormalizedConfig;
    readonly warnings: CompilerDiagnostic[] = [];

    readonly seenIds: Set<string> = new Set();
    readonly seenSlots: Set<string> = new Set();

    /**
     * Scopes keep track of context from sibling nodes and the hierarchy of ParentNodes as the parser
     * traverses the parse5 AST. Each scope object contains the following:
     * - an array where each node in the array corresponds to either a ForEach, ForOf, If, Element, Component, or Slot.
     * - an array holding a cache of the immediately preceding sibling's scope, if relevant.
     *      - currently, that's IFF the parser is in the process of parsing a series of sibling if|elseif|else directives.
     *
     * Currently, each scope has a hierarchy of ForBlock > IfBlock > Element | Component | Slot.
     * Note: Not all scopes will have all three, but when they do, they will appear in this order.
     * We do not keep track of template nodes.
     *
     * Each scope corresponds to the original parse5.Element node.
     */
    private readonly scopes: ParentNode[][] = [];
    private readonly siblings: ParentNode[][] = [];

    renderMode: LWCDirectiveRenderMode;
    preserveComments: boolean;

    constructor(source: String, config: NormalizedConfig) {
        this.source = source;
        this.config = config;
        this.renderMode = LWCDirectiveRenderMode.shadow;
        this.preserveComments = config.preserveHtmlComments;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    setRootDirective(root: Root): void {
        this.renderMode =
            root.directives.find(isRenderModeDirective)?.value.value ?? this.renderMode;
        this.preserveComments =
            root.directives.find(isPreserveCommentsDirective)?.value.value || this.preserveComments;
    }

    /**
     * This method flattens the scopes into a single array for traversal.
     */
    *ancestors(element?: ParentNode): IterableIterator<ParentWrapper> {
        const ancestors = ([] as ParentNode[]).concat(...this.scopes);
        const start = element ? ancestors.indexOf(element) : ancestors.length - 1;

        for (let i = start; i >= 0; i--) {
            yield { current: ancestors[i], parent: ancestors[i - 1] };
        }
    }

    /**
     * This method returns an iterator over ancestor nodes, starting at the parent and ending at the root node.
     *
     * Note: There are instances when we want to terminate the traversal early, such as searching for a ForBlock parent.
     *
     * @param {ParentNode} startNode - Starting node to begin search, defaults to the tail of the current scope.
     * @param {function} predicate - This callback is called once for each ancestor until it finds one where predicate returns true.
     * @param {function} traversalCond - This callback is called after predicate and will terminate the traversal if it returns false.
     * traversalCond is ignored if no value is provided.
     */
    findAncestor<A extends ParentNode>(
        predicate: (node: ParentNode) => node is A,
        traversalCond: (nodes: ParentWrapper) => unknown = () => true,
        startNode?: ParentNode
    ): A | null {
        for (const { current, parent } of this.ancestors(startNode)) {
            if (predicate(current)) {
                return current;
            }

            if (!traversalCond({ current, parent })) {
                break;
            }
        }

        return null;
    }

    /**
     * This method searchs the current scope and returns the value that satisfies the predicate.
     *
     * @param {function} predicate - This callback is called once for each sibling in the current scope
     * until it finds one where predicate returns true.
     */
    findSibling<A extends ParentNode>(predicate: (node: ParentNode) => node is A): A | null {
        const currentScope = this.currentScope() || [];
        const sibling = currentScope.find(predicate);
        return sibling || null;
    }

    beginScope(): void {
        this.scopes.push([]);
    }

    endScope(): void {
        const scope = this.scopes.pop();
        if (scope) {
            this.setSiblingScope(scope);
        }
    }

    addNodeCurrentScope(node: ParentNode): void {
        const currentScopeNodes = this.currentScope();

        if (!currentScopeNodes) {
            throw new Error("Can't invoke addNodeCurrentScope if there is no current scope");
        }

        currentScopeNodes.push(node);
    }

    beginSiblingScope() {
        this.siblings.push([]);
    }

    endSiblingScope() {
        this.siblings.pop();
    }

    clearSiblingScope() {
        this.setSiblingScope([]);
    }

    getPrevSiblingIfNode(): IfBlock | undefined {
        const currentSiblingScope = this.currentSiblingScope();
        if (!currentSiblingScope) {
            throw new Error("Can't invoke getPrevSiblingIfNode if there is no current scope");
        }

        if (currentSiblingScope[0] && isIfBlock(currentSiblingScope[0])) {
            return currentSiblingScope[0];
        }
        return undefined;
    }

    private currentScope(): ParentNode[] | undefined {
        return this.scopes[this.scopes.length - 1];
    }

    private currentSiblingScope(): ParentNode[] | undefined {
        return this.siblings[this.siblings.length - 1];
    }

    private setSiblingScope(nodes: ParentNode[]) {
        this.siblings[this.siblings.length - 1] = nodes;
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

    /**
     * This method throws a diagnostic error with the node's location.
     */
    throwOnNode(errorInfo: LWCErrorInfo, node: BaseNode, messageArgs?: any[]): never {
        this.throw(errorInfo, messageArgs, node.location);
    }

    /**
     * This method throws a diagnostic error with location information.
     */
    throwAtLocation(errorInfo: LWCErrorInfo, location: SourceLocation, messageArgs?: any[]): never {
        this.throw(errorInfo, messageArgs, location);
    }

    /**
     * This method throws a diagnostic error and will immediately exit the current routine.
     */
    throw(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: SourceLocation): never {
        throw generateCompilerError(errorInfo, {
            messageArgs,
            origin: {
                location: normalizeLocation(location),
            },
        });
    }

    /**
     * This method logs a diagnostic warning with the node's location.
     */
    warnOnNode(errorInfo: LWCErrorInfo, node: BaseNode, messageArgs?: any[]): void {
        this.warn(errorInfo, messageArgs, node.location);
    }

    /**
     * This method logs a diagnostic warning with location information.
     */
    warnAtLocation(errorInfo: LWCErrorInfo, location: SourceLocation, messageArgs?: any[]): void {
        this.warn(errorInfo, messageArgs, location);
    }

    /**
     * This method logs a diagnostic warning and will continue execution of the current routine.
     */
    warn(errorInfo: LWCErrorInfo, messageArgs?: any[], location?: SourceLocation): void {
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
}
