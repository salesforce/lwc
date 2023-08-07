/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerDiagnostic,
    CompilerError,
    InstrumentationObject,
    generateCompilerDiagnostic,
    generateCompilerError,
    Location,
    LWCErrorInfo,
    normalizeToDiagnostic,
} from '@lwc/errors';
import { APIVersion } from '@lwc/shared';
import { NormalizedConfig } from '../config';
import { isPreserveCommentsDirective, isRenderModeDirective } from '../shared/ast';
import {
    Root,
    SourceLocation,
    ParentNode,
    BaseNode,
    LWCDirectiveRenderMode,
    IfBlock,
    ElseifBlock,
    ElseBlock,
} from '../shared/types';
import { TMPL_EXPR_ECMASCRIPT_EDITION } from './constants';
import type { ecmaVersion as EcmaVersion } from 'acorn';
import type { PreparsedExpressionMap } from './expression-complex';

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

interface IfContext {
    currentNode: IfBlock | ElseifBlock | ElseBlock;

    // Within a specific if-context, each set of seen slot names must be tracked separately
    // because duplicate names in separate branches of the same if-block are allowed (the branching
    // logic provides a compile-time guarantee that the slots will not be rendered multiple times).
    // seenSlots keeps track of each set holding the slots seen in each branch of the if-block.
    seenSlots: Set<string>[];
}

// A SiblingScope object keeps track of the context needed to parse a series of if-elseif-else nodes.
interface SiblingScope {
    // Context for the if-elseif-else chain currently being parsed at this level. This
    // IfContext keeps track of the most recently parsed node in the chain and the set of slot names we've seen in all
    // previous siblings in the chain.
    ifContext?: IfContext;

    // Reference to the nearest ancestor IfContext. The existence of an ancestor
    // IfContext means that we are currently parsing nodes nested within an if-elseif-else chain. Context from that ancestor
    // is needed to track which slot names have already been seen in and only in the current scope. This reference is also needed
    // so we know where to merge all visited slot names from the current IfContext.
    ancestorIfContext?: IfContext;
}

export default class ParserCtx {
    private readonly source: String;

    readonly config: NormalizedConfig;
    readonly warnings: CompilerDiagnostic[] = [];

    /**
     * Instrumentation object to handle gathering metrics and internal logs for everything happening
     * during this context.
     */
    readonly instrumentation?: InstrumentationObject;

    readonly seenIds: Set<string> = new Set();
    readonly seenSlots: Set<string> = new Set();
    /**
     * This set is not aware of if-elseif-else blocks.
     */
    readonly seenScopedSlots: Set<string> = new Set();

    // TODO [#3370]: remove experimental template expression flag
    readonly ecmaVersion: EcmaVersion;

    // TODO [#3370]: remove experimental template expression flag
    /**
     * Parsing of template expressions is deferred to acorn, in order to ensure that JavaScript expressions
     * are parsed correctly. As such, we should cache the ESTree AST for each expression, so that the
     * expression need not be re-parsed when the template compiler's AST is being created.
     */
    readonly preparsedJsExpressions?: PreparsedExpressionMap;

    /**
     * 'elementScopes' keeps track of the hierarchy of ParentNodes as the parser
     * traverses the parse5 AST. Each 'elementScope' is an array where each node in
     * the array corresponds to either an IfBlock, ElseifBlock, ElseBlock, ForEach, ForOf, If, Element, Component, or Slot.
     *
     * Currently, each elementScope has a hierarchy of IfBlock > ForBlock > If > Element | Component | Slot.
     * Note: Not all elementScopes will have all the nodes listed above, but when they do, they will appear in this order.
     * We do not keep track of template nodes.
     *
     * Each scope corresponds to the original parse5.Element node.
     */
    private readonly elementScopes: ParentNode[][] = [];

    /**
     * 'siblingScopes' keeps track of the context from one sibling node to another.
     * This holds the info needed to properly parse lwc:if, lwc:elseif, and lwc:else directives.
     */
    private readonly siblingScopes: SiblingScope[] = [];

    renderMode: LWCDirectiveRenderMode;
    preserveComments: boolean;
    apiVersion: APIVersion;

    constructor(source: String, config: NormalizedConfig) {
        this.source = source;
        this.config = config;
        this.renderMode = LWCDirectiveRenderMode.shadow;
        this.preserveComments = config.preserveHtmlComments;
        // TODO [#3370]: remove experimental template expression flag
        if (config.experimentalComplexExpressions) {
            this.preparsedJsExpressions = new Map();
        }
        this.ecmaVersion = config.experimentalComplexExpressions
            ? TMPL_EXPR_ECMASCRIPT_EDITION
            : 2020;
        this.instrumentation = config.instrumentation;
        this.apiVersion = config.apiVersion;
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
        const ancestors = this.elementScopes.flat();
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
    findInCurrentElementScope<A extends ParentNode>(
        predicate: (node: ParentNode) => node is A
    ): A | null {
        const currentScope = this.currentElementScope() || [];
        return currentScope.find(predicate) || null;
    }

    beginElementScope(): void {
        this.elementScopes.push([]);
    }

    endElementScope(): ParentNode | undefined {
        const scope = this.elementScopes.pop();
        return scope ? scope[0] : undefined;
    }

    addNodeCurrentElementScope(node: ParentNode): void {
        const currentScope = this.currentElementScope();

        /* istanbul ignore if */
        if (!currentScope) {
            throw new Error("Can't invoke addNodeCurrentElementScope if there is no current scope");
        }

        currentScope.push(node);
    }

    hasSeenSlot(name: string): boolean {
        return this.seenSlotsFromAncestorIfTree().has(name);
    }

    addSeenSlot(name: string): void {
        const currentSeenSlots = this.seenSlotsFromAncestorIfTree();
        if (currentSeenSlots) {
            currentSeenSlots.add(name);
        } else {
            this.seenSlots.add(name);
        }
    }

    private currentElementScope(): ParentNode[] | undefined {
        return this.elementScopes[this.elementScopes.length - 1];
    }

    beginSiblingScope() {
        this.siblingScopes.push({
            ancestorIfContext: this.currentIfContext() || this.ancestorIfContext(),
        });
    }

    endSiblingScope() {
        this.siblingScopes.pop();
    }

    beginIfChain(node: IfBlock) {
        const currentSiblingContext = this.currentSiblingContext();
        if (!currentSiblingContext) {
            throw new Error('Cannot invoke beginIfChain if there is currently no sibling context');
        }

        const currentIfContext = this.currentIfContext();
        if (currentIfContext) {
            throw new Error(
                'Should not invoke beginIfChain if an if context already exists. First end the current chain before starting a new one.'
            );
        }

        const previouslySeenSlots = this.seenSlotsFromAncestorIfTree();
        currentSiblingContext.ifContext = {
            currentNode: node,
            seenSlots: [new Set<string>(previouslySeenSlots)],
        };
    }

    appendToIfChain(node: ElseifBlock | ElseBlock) {
        const currentIfContext = this.currentIfContext();
        if (!currentIfContext) {
            throw new Error('Cannot invoke appendToIfChain without first setting the if context.');
        }

        currentIfContext.currentNode = node;

        const previouslySeenSlots = this.seenSlotsFromAncestorIfTree();
        currentIfContext.seenSlots.push(new Set<string>(previouslySeenSlots));
    }

    endIfChain() {
        const currentIfContext = this.currentIfContext();
        if (!currentIfContext) {
            throw new Error('Cannot invoke endIfChain if there is currently no if context');
        }

        // Merge seen slot names from the current if chain into the parent scope.
        const seenSlotsInAncestorIfTree = this.seenSlotsFromAncestorIfTree();
        for (const seenSlots of currentIfContext.seenSlots) {
            for (const name of seenSlots) {
                seenSlotsInAncestorIfTree.add(name);
            }
        }

        const currentSiblingContext = this.currentSiblingContext();
        if (currentSiblingContext) {
            currentSiblingContext.ifContext = undefined;
        }
    }

    getSiblingIfNode(): IfBlock | ElseifBlock | ElseBlock | undefined {
        return this.currentIfContext()?.currentNode;
    }

    isParsingSiblingIfBlock(): boolean {
        return !!this.currentIfContext();
    }

    private currentSiblingContext(): SiblingScope | undefined {
        return this.siblingScopes[this.siblingScopes.length - 1];
    }

    private currentIfContext(): IfContext | undefined {
        return this.currentSiblingContext()?.ifContext;
    }

    private ancestorIfContext(): IfContext | undefined {
        return this.currentSiblingContext()?.ancestorIfContext;
    }

    private seenSlotsFromAncestorIfTree(): Set<string> {
        const ancestorIfContext = this.ancestorIfContext();
        if (ancestorIfContext) {
            return ancestorIfContext.seenSlots[ancestorIfContext.seenSlots.length - 1];
        }
        return this.seenSlots;
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
            /* istanbul ignore else */
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
