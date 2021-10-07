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
import { LWC_RENDERMODE } from '../shared/constants';
import { isDirectiveType } from '../shared/ir';

import { Root, SourceLocation, ParentNode, BaseNode } from '../shared/types';

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
export default class ParserCtx {
    private readonly source: String;
    readonly config: ResolvedConfig;
    readonly warnings: CompilerDiagnostic[] = [];
    readonly seenIds: Set<string> = new Set();
    readonly seenSlots: Set<string> = new Set();

    private readonly ancestors: ParentNode[][] = [[]];

    renderMode: string;
    preserveComments: boolean;

    constructor(source: String, config: ResolvedConfig) {
        this.source = source;
        this.config = config;
        this.renderMode = LWC_RENDERMODE.SHADOW;
        this.preserveComments = config.preserveHtmlComments;
    }

    getSource(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    *getAncestors(element?: ParentNode) {
        const array: ParentNode[] = [];
        const ancestors = array.concat(...this.ancestors);
        const start = element ? ancestors.indexOf(element) : ancestors.length - 1;

        for (let i = start; i >= 0; i--) {
            yield { current: ancestors[i], parent: ancestors[i - 1] };
        }
    }

    findAncestor({
        element,
        predicate,
        traversalCond = () => true,
    }: {
        element?: ParentNode;
        predicate: (elm: ParentNode) => unknown;
        traversalCond?: (nodes: { current: ParentNode; parent: ParentNode | null }) => unknown;
    }): ParentNode | null {
        for (const { current, parent } of this.getAncestors(element)) {
            if (predicate(current)) {
                return current;
            }
            if (!traversalCond({ current, parent })) {
                break;
            }
        }
        return null;
    }

    beginAncestors() {
        this.ancestors.push([]);
    }

    endAncestors() {
        this.ancestors.pop();
    }

    current() {
        return this.ancestors[this.ancestors.length - 1];
    }

    addParent(parent: ParentNode) {
        this.current().push(parent);
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
    throwAtLocation(
        errorInfo: LWCErrorInfo,
        location: SourceLocation,
        messageArgs?: any[]
    ): never {
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

    setRootDirective(root: Root) {
        this.renderMode =
            root.directives?.find(isDirectiveType('RenderMode'))?.value.value ?? this.renderMode;
        this.preserveComments =
            root.directives?.find(isDirectiveType('PreserveComments'))?.value.value ||
            this.preserveComments;
    }
}
