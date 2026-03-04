/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * NOTE: @swc/core's JavaScript Visitor API is deprecated in favor of Wasm plugins,
 * but it remains the only TypeScript-level AST mutation mechanism available.
 * We use it here per the architectural decision documented in docs/adr/swc-approach.md.
 *
 * IMPORTANT NOTE ON TRAVERSAL:
 * The base Visitor's visitModule/visitProgram replaces m.body with a new array via map().
 * This means mutations to m.body during traversal are discarded.
 * To handle node insertion (e.g., adding const varDecl before export default), we use a
 * custom manual traversal in visitProgram that builds a new body array directly.
 */
// @ts-ignore — @swc/core/Visitor.js requires the explicit .js extension for ESM compatibility
import { Visitor } from '@swc/core/Visitor.js';

import { scopeCssImports } from './scope-css-imports';
import {
    processClass,
    removeImportedDecoratorSpecifiers,
    validateImportedLwcDecoratorUsage,
} from './decorators/index';
import { processExportDefault } from './component';
import { processDynamicImport, isDynamicImport, createDynamicImportState } from './dynamic-imports';
import type {
    Program,
    ClassDeclaration,
    ClassExpression,
    ClassMember,
    ExportDefaultDeclaration,
    ExportDefaultExpression,
    CallExpression,
    Expression,
    ModuleDeclaration,
    Declaration,
    ImportDeclaration,
    VariableDeclaration,
    Identifier,
    Span,
    ModuleItem,
    BlockStatement,
    Statement,
} from '@swc/types';
import type { CompilerDiagnostic } from '@lwc/errors';
import type { LwcSwcPluginOptions, BindingInfo } from './types';
import type { VisitorState } from './utils';
import type { DynamicImportState } from './dynamic-imports';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

/**
 * LWC SWC Visitor — applies all LWC-specific AST transformations.
 */
export class LwcSwcVisitor extends Visitor {
    private readonly _errors: CompilerDiagnostic[] = [];
    private readonly _code: string;
    private readonly _opts: LwcSwcPluginOptions;
    private _program: Program | null = null;
    private _bindingMap: Map<string, BindingInfo> = new Map();
    private readonly _visitedClasses: WeakSet<object> = new WeakSet();
    private readonly _dynamicImportState: DynamicImportState = createDynamicImportState();
    /**
     * Pending insertions: maps an original ModuleItem reference to an array of
     * ModuleItems to insert BEFORE it in the final body array.
     */
    private readonly _pendingInsertsBefore: Map<object, ModuleItem[]> = new Map();
    /**
     * Pending replacements: maps an original ModuleItem reference to an array
     * of ModuleItems that should REPLACE it.
     */
    private readonly _pendingReplacements: Map<object, ModuleItem[]> = new Map();

    constructor(code: string, opts: LwcSwcPluginOptions) {
        super();
        this._code = code;
        this._opts = opts;
    }

    getErrors(): CompilerDiagnostic[] {
        return this._errors;
    }

    private get _state(): VisitorState & {
        bindingMap: Map<string, BindingInfo>;
        opts: LwcSwcPluginOptions;
    } {
        return {
            code: this._code,
            filename: this._opts.filename,
            errors: this._errors,
            errorRecoveryMode: this._opts.experimentalErrorRecoveryMode ?? false,
            instrumentation: this._opts.instrumentation,
            bindingMap: this._bindingMap,
            opts: this._opts,
        };
    }

    // --- Program-level (manual traversal) ---

    visitProgram(program: Program): Program {
        this._program = program;

        // Pass 1: Build binding map from import declarations and const declarations
        this._buildBindingMap(program);

        // Pass 2: Validate LWC decorator imports usage
        validateImportedLwcDecoratorUsage(program, this._state);

        // Pass 3: Annotate .scoped.css imports
        scopeCssImports(program);

        // Pass 4: Manually traverse body, applying class/export/dynamic-import transforms.
        // We do NOT use super.visitProgram because its visitModule() replaces m.body with
        // a new map() result AFTER our per-node callbacks have mutated the array.
        // Instead we build the new body array here, honoring pending insertions and replacements.
        //
        // IMPORTANT: Take a snapshot of body items before iteration.
        // processExportDefault calls injectNamedImport which mutates program.body by unshifting
        // new import declarations. If we iterate program.body directly, those newly prepended
        // imports would shift item indices and cause double-processing.
        const body = program.type === 'Module' ? program.body : (program as any).body;
        const bodySnapshot = [...body] as ModuleItem[];
        const newBody: ModuleItem[] = [];

        for (const item of bodySnapshot) {
            const transformed = this._visitModuleItem(item);
            newBody.push(...transformed);
        }

        // Prepend any imports that were injected by injectNamedImport/injectDefaultImport
        // during the traversal. Those functions unshift to program.body; we need to
        // collect them and put them first in newBody.
        // The injected imports are now in body (program.body) but not in bodySnapshot.
        const injectedImports = (
            program.type === 'Module' ? program.body : (program as any).body
        ).filter((item: ModuleItem) => !bodySnapshot.includes(item));

        // Assign the new body: injected imports first, then transformed original items
        (program as any).body = [...injectedImports, ...newBody];

        // Pass 5: Remove decorator import specifiers from 'lwc'
        removeImportedDecoratorSpecifiers(program);

        return program;
    }

    /**
     * Process a single module item, returning one or more replacement items.
     */
    private _visitModuleItem(item: ModuleItem): ModuleItem[] {
        switch (item.type) {
            case 'ExportDefaultDeclaration':
                return this._visitExportDefaultDeclarationItem(item as ExportDefaultDeclaration);
            case 'ExportDefaultExpression':
                return this._visitExportDefaultExpressionItem(item as ExportDefaultExpression);
            case 'ClassDeclaration':
                return this._visitClassDeclarationItem(item as ClassDeclaration);
            default:
                // For all other items, apply sub-expression traversal for dynamic imports
                return [this._visitItemForDynamicImports(item)];
        }
    }

    /**
     * Process an ExportDefaultDeclaration, potentially returning [varDecl, newExport].
     */
    private _visitExportDefaultDeclarationItem(node: ExportDefaultDeclaration): ModuleItem[] {
        if (!this._program) return [node];

        // Capture the original class name BEFORE _visitItemForDynamicImports is called.
        //
        // _visitItemForDynamicImports invokes the base-class SWC Visitor, which traverses the
        // decl and triggers visitClassExpression for any ClassExpression found. Our override of
        // visitClassExpression calls processClass, which converts the class into a
        // registerDecorators(class {...}, {...}) CallExpression in-place. After that traversal
        // the decl.type is 'CallExpression' and the original class identifier is no longer
        // accessible. We must extract the class name here, before traversal.
        let originalClassName: string | undefined;
        if (node.decl && node.decl.type === 'ClassExpression') {
            originalClassName = (node.decl as ClassExpression).identifier?.value;
        }

        // Traverse for dynamic imports BEFORE class processing so visitCallExpression handles them.
        const visitedNode = this._visitItemForDynamicImports(
            node as unknown as ModuleItem
        ) as unknown as ExportDefaultDeclaration;

        // Process any class inside the export if it hasn't already been transformed by the
        // visitClassExpression override triggered above (in that case decl is now a CallExpression).
        // SWC's ExportDefaultDeclaration.decl can be ClassExpression | FunctionExpression | TsInterfaceDeclaration
        if (visitedNode.decl && visitedNode.decl.type === 'ClassExpression') {
            const classExpr = visitedNode.decl as ClassExpression;
            const { replacementExpression } = processClass(
                this._program,
                classExpr,
                false,
                this._visitedClasses,
                this._state
            );
            if (replacementExpression) {
                (visitedNode as any).decl = replacementExpression;
            }
        }

        const items = processExportDefault(
            this._program,
            visitedNode,
            this._opts,
            originalClassName
        );
        if (items && items.length > 0) {
            return items as ModuleItem[];
        }

        return [visitedNode];
    }

    /**
     * Process an ExportDefaultExpression.
     */
    private _visitExportDefaultExpressionItem(node: ExportDefaultExpression): ModuleItem[] {
        if (!this._program) return [node];

        // Apply dynamic import transforms to the expression by using Visitor traversal
        const visitedNode = this._visitItemForDynamicImports(
            node as unknown as ModuleItem
        ) as unknown as ExportDefaultExpression;

        const items = processExportDefault(this._program, visitedNode, this._opts);
        if (items && items.length > 0) {
            return items as ModuleItem[];
        }

        return [visitedNode as unknown as ModuleItem];
    }

    /**
     * Process a ClassDeclaration at module level.
     */
    private _visitClassDeclarationItem(node: ClassDeclaration): ModuleItem[] {
        if (!this._program) return [node];

        // First, traverse the class body for dynamic imports (visitCallExpression handles these).
        // This must happen before processClass so the class body is already traversed.
        const visitedNode = this._visitItemForDynamicImports(
            node as unknown as ModuleItem
        ) as unknown as ClassDeclaration;

        const { afterStatement, replacementExpression } = processClass(
            this._program,
            visitedNode,
            true,
            this._visitedClasses,
            this._state
        );

        const result: ModuleItem[] = [visitedNode as unknown as ModuleItem];
        if (afterStatement) {
            result.push(afterStatement as unknown as ModuleItem);
        } else if (replacementExpression) {
            // Anonymous class declaration wrapped in registerDecorators
            const varDecl: VariableDeclaration = {
                type: 'VariableDeclaration',
                kind: 'const',
                declare: false,
                declarations: [
                    {
                        type: 'VariableDeclarator',
                        id: {
                            type: 'Identifier',
                            value: '_cls',
                            optional: false,
                            span: DUMMY_SPAN,
                            ctxt: 0,
                        } as any,
                        init: replacementExpression as Expression,
                        definite: false,
                        span: DUMMY_SPAN,
                    },
                ],
                span: DUMMY_SPAN,
                ctxt: 0,
            } as any;
            return [varDecl as unknown as ModuleItem];
        }

        return result;
    }

    /**
     * Dynamic import traversal: use Visitor's full tree traversal for non-export-default items.
     * This handles dynamic imports nested inside function bodies, async functions, etc.
     */
    private _visitItemForDynamicImports(item: ModuleItem): ModuleItem {
        if (item.type === 'ImportDeclaration') {
            // Import declarations don't contain dynamic imports
            return item;
        }
        // Use the Visitor's traversal for all statements. This triggers visitCallExpression
        // for any CallExpression nodes, including those nested inside function bodies.
        return this.visitModuleItem(item) as ModuleItem;
    }

    /**
     * Override visitClassExpression to apply LWC decorator transforms to class expressions
     * that appear in non-module-level positions (e.g., class expressions used in assignments
     * or as default exports where they weren't already processed at module level).
     * The _visitedClasses WeakSet prevents double-processing.
     */
    visitClassExpression(node: ClassExpression): ClassExpression {
        // First, let the base class traverse child nodes
        const visited = super.visitClassExpression(node);

        if (!this._program) return visited;

        const { replacementExpression } = processClass(
            this._program,
            visited as ClassExpression,
            false,
            this._visitedClasses,
            this._state
        );

        if (replacementExpression) {
            // Return the registerDecorators(...) call expression in place of the class expression.
            // This is valid since SWC treats the return value of visitClassExpression as the
            // replacement expression node.
            return replacementExpression as unknown as ClassExpression;
        }

        return visited;
    }

    /**
     * Override visitBlockStatement to process ClassDeclaration nodes within block bodies.
     * This ensures that LWC classes defined inside function bodies (e.g., in test callbacks)
     * also get registerDecorators() inserted after them.
     */
    visitBlockStatement(block: BlockStatement): BlockStatement {
        if (!this._program) {
            return super.visitBlockStatement(block);
        }

        // Process statements, potentially expanding ClassDeclarations into [ClassDeclaration, ExpressionStatement]
        const newStmts: Statement[] = [];
        for (const stmt of block.stmts) {
            if (stmt.type === 'ClassDeclaration') {
                // First traverse child nodes for dynamic imports
                const visited = super.visitClassDeclaration(stmt as ClassDeclaration);
                const { afterStatement } = processClass(
                    this._program,
                    visited as ClassDeclaration,
                    true,
                    this._visitedClasses,
                    this._state
                );
                newStmts.push(visited as unknown as Statement);
                if (afterStatement) {
                    newStmts.push(afterStatement as unknown as Statement);
                }
            } else {
                newStmts.push(this.visitStatement(stmt));
            }
        }
        block.stmts = newStmts;
        return block;
    }

    /**
     * Override visitCallExpression to intercept dynamic import() calls.
     * Called by the Visitor's default traversal via _visitItemForDynamicImports.
     */
    visitCallExpression(node: CallExpression): Expression {
        const visited = super.visitCallExpression(node);

        if (isDynamicImport(visited as CallExpression) && this._program) {
            return processDynamicImport(
                this._program,
                visited as CallExpression,
                this._state,
                this._dynamicImportState
            );
        }

        return visited as Expression;
    }

    private _buildBindingMap(program: Program): void {
        const body = program.type === 'Module' ? program.body : (program as any).body;
        for (const node of body) {
            if (node.type === 'ImportDeclaration') {
                const decl = node as ImportDeclaration;
                for (const spec of decl.specifiers) {
                    let localName: string;
                    if (spec.type === 'ImportSpecifier') {
                        localName = (spec as any).local.value;
                    } else if (spec.type === 'ImportDefaultSpecifier') {
                        localName = (spec as any).local.value;
                    } else if (spec.type === 'ImportNamespaceSpecifier') {
                        localName = (spec as any).local.value;
                    } else {
                        continue;
                    }
                    this._bindingMap.set(localName, {
                        kind: 'module',
                        source: decl.source.value,
                    });
                }
            } else if (node.type === 'VariableDeclaration') {
                const varDecl = node as VariableDeclaration;
                if (varDecl.kind === 'const') {
                    for (const declarator of varDecl.declarations) {
                        if (declarator.id.type !== 'Identifier') continue;
                        const name = (declarator.id as unknown as Identifier).value;
                        const init = declarator.init;
                        if (!init) continue;

                        const SUPPORTED_MAP: Record<string, 'string' | 'number' | 'boolean'> = {
                            StringLiteral: 'string',
                            NumericLiteral: 'number',
                            BooleanLiteral: 'boolean',
                        };

                        if (SUPPORTED_MAP[init.type]) {
                            this._bindingMap.set(name, {
                                kind: 'const',
                                valueType: SUPPORTED_MAP[init.type],
                                value: (init as any).value,
                            });
                        }
                    }
                }
            }
        }
    }
}

/**
 * Post-processes the generated code to inject LWC compiler version comments.
 *
 * Babel's @lwc/babel-plugin-component adds `/ *LWC compiler vX.X.X* /` as a trailing comment
 * to every class body that has a superclass. Since SWC's TypeScript Visitor API does not
 * support direct comment injection on AST nodes, we perform a regex-based post-processing
 * pass on the generated code string.
 *
 * Strategy: Find all `class [Name] extends [Something] {` patterns in the generated code.
 * For each such class, inject the version comment before the closing `}` of the class body.
 *
 * SWC's code generator produces consistent indented output, so we can reliably find
 * the end of each class body.
 */
export function injectVersionComments(code: string, versionComment: string): string {
    // Match `class [OptionalName] extends [Expr] {` — the opening of a class with a superclass.
    // We use bracket counting to find the matching closing `}` for each class.
    //
    // IMPORTANT: We do NOT recurse into nested class bodies. After processing each class,
    // we resume searching AFTER the class's closing `}`. This avoids injecting comments into
    // nested `class extends ...` inside method bodies (e.g. `customElements.define('x', class extends HTMLElement { ... })`),
    // which would produce corrupt code if lastIndex/result pointers are misaligned.
    const CLASS_WITH_SUPER_RE = /\bclass(?:\s+\w+)?\s+extends\s+[^\{]+\{/g;

    let result = '';
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // eslint-disable-next-line no-cond-assign
    while ((match = CLASS_WITH_SUPER_RE.exec(code)) !== null) {
        // Only process this match if it starts at or after lastIndex
        // (skip matches that fall inside a class body we've already processed)
        if (match.index < lastIndex) {
            continue;
        }

        const classOpenBraceIndex = match.index + match[0].length - 1; // index of `{`
        // Find the matching closing `}` using bracket counting
        let depth = 1;
        let i = classOpenBraceIndex + 1;
        while (i < code.length && depth > 0) {
            if (code[i] === '{') depth++;
            else if (code[i] === '}') depth--;
            i++;
        }
        // i is now one past the closing `}`
        const classCloseBraceIndex = i - 1;

        // Inject the version comment right before the closing `}`.
        // Add a newline before the comment if the character before `}` is not already a newline.
        const beforeClose = code.slice(lastIndex, classCloseBraceIndex);
        const commentStr = `/*${versionComment}*/`;
        const needsNewline = beforeClose.length > 0 && beforeClose[beforeClose.length - 1] !== '\n';
        result += beforeClose + (needsNewline ? '\n' : '') + commentStr;
        lastIndex = classCloseBraceIndex;
        // Resume searching AFTER the class's closing `}` to avoid processing nested classes
        CLASS_WITH_SUPER_RE.lastIndex = i;
    }

    result += code.slice(lastIndex);
    return result;
}
