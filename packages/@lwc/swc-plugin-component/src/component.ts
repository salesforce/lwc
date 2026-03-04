/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { basename, extname } from 'node:path';
import { generateCustomElementTagName, getAPIVersionFromNumber } from '@lwc/shared';
import {
    LWC_PACKAGE_ALIAS,
    REGISTER_COMPONENT_ID,
    TEMPLATE_KEY,
    COMPONENT_NAME_KEY,
    API_VERSION_KEY,
    COMPONENT_CLASS_ID,
    SYNTHETIC_ELEMENT_INTERNALS_KEY,
    COMPONENT_FEATURE_FLAG_KEY,
} from './constants';
import { injectNamedImport, injectDefaultImport } from './import-helpers';
import type {
    Program,
    ExportDefaultDeclaration,
    ExportDefaultExpression,
    Expression,
    ClassExpression,
    Identifier,
    StringLiteral,
    NumericLiteral,
    BooleanLiteral,
    ObjectExpression,
    KeyValueProperty,
    VariableDeclaration,
    VariableDeclarator,
    ModuleItem,
    Span,
    Pattern,
} from '@swc/types';
import type { LwcSwcPluginOptions } from './types';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

function makeStringLiteral(value: string): StringLiteral {
    return { type: 'StringLiteral', value, span: DUMMY_SPAN, raw: JSON.stringify(value) };
}

function makeNumericLiteral(value: number): NumericLiteral {
    return { type: 'NumericLiteral', value, span: DUMMY_SPAN };
}

function makeBooleanLiteral(value: boolean): BooleanLiteral {
    return { type: 'BooleanLiteral', value, span: DUMMY_SPAN };
}

function makeObjectExpression(properties: KeyValueProperty[]): ObjectExpression {
    return { type: 'ObjectExpression', properties, span: DUMMY_SPAN };
}

function makeKeyValueProperty(
    key: Identifier | StringLiteral,
    value: Expression
): KeyValueProperty {
    return { type: 'KeyValueProperty', key, value };
}

function getBaseName(classPath: string) {
    const ext = extname(classPath);
    return basename(classPath, ext);
}

/**
 * Checks whether a default export declaration needs registerComponent wrapping.
 */
function needsComponentRegistration(expr: Expression): boolean {
    if (expr.type === 'Identifier') {
        const id = expr as Identifier;
        return id.value !== 'undefined' && id.value !== 'null';
    }
    return (
        expr.type === 'CallExpression' ||
        expr.type === 'ClassExpression' ||
        expr.type === 'ConditionalExpression'
    );
}

/**
 * Processes an `export default ...` declaration/expression and wraps it
 * with `registerComponent(...)` if needed.
 *
 * Returns the array of ModuleItems to replace the export default statement with.
 * If no transformation is needed, returns null.
 */
export function processExportDefault(
    program: Program,
    node: ExportDefaultDeclaration | ExportDefaultExpression,
    opts: LwcSwcPluginOptions,
    originalClassName?: string
): ModuleItem[] | null {
    if (opts.isExplicitImport) {
        return null;
    }

    // Get the declaration expression
    let declarationExpr: Expression;
    if (node.type === 'ExportDefaultExpression') {
        declarationExpr = node.expression;
    } else {
        // ExportDefaultDeclaration — decl is ClassExpression | FunctionExpression | TsInterfaceDeclaration
        // It may also be a CallExpression if the class was pre-transformed by processClass
        // (e.g., registerDecorators(classExpr, {...}))
        const decl = (node as any).decl;
        if (
            decl.type === 'ClassExpression' ||
            decl.type === 'FunctionExpression' ||
            decl.type === 'CallExpression'
        ) {
            declarationExpr = decl as Expression;
        } else {
            return null;
        }
    }

    if (!needsComponentRegistration(declarationExpr)) {
        return null;
    }

    // Inject registerComponent import
    const registerComponentLocalName = injectNamedImport(
        program,
        REGISTER_COMPONENT_ID,
        LWC_PACKAGE_ALIAS
    );

    // Inject default template import: import _tmpl from './ComponentName.html'
    // injectDefaultImport returns the actual Identifier node (with original ctxt) to avoid
    // SWC renaming the binding when an explicit import already exists in the source.
    const componentName = getBaseName(opts.filename);
    const templateIdentifier = injectDefaultImport(
        program,
        `./${componentName}.html`,
        TEMPLATE_KEY
    );

    // Optionally inject feature flag module
    let featureFlagIdentifier: Identifier | undefined;
    if (opts.componentFeatureFlagModulePath) {
        featureFlagIdentifier = injectDefaultImport(
            program,
            opts.componentFeatureFlagModulePath,
            COMPONENT_FEATURE_FLAG_KEY
        );
    }

    const apiVersion = getAPIVersionFromNumber(opts.apiVersion);
    const componentRegisteredName = generateCustomElementTagName(opts.namespace, opts.name);

    // Handle class declarations: pull the class out before the export
    let classNodeExpr: Expression = declarationExpr;
    if (declarationExpr.type === 'ClassExpression') {
        // ClassExpression can be used directly or it may have been transformed to have an identifier
        classNodeExpr = declarationExpr;
    }

    // Build properties for registerComponent(...)
    // Use the actual Identifier node returned by injectDefaultImport to preserve ctxt.
    const properties: KeyValueProperty[] = [
        makeKeyValueProperty(makeIdentifier(TEMPLATE_KEY), templateIdentifier),
        makeKeyValueProperty(
            makeIdentifier(COMPONENT_NAME_KEY),
            makeStringLiteral(componentRegisteredName)
        ),
        makeKeyValueProperty(makeIdentifier(API_VERSION_KEY), makeNumericLiteral(apiVersion)),
    ];

    if (featureFlagIdentifier) {
        properties.push(
            makeKeyValueProperty(
                makeIdentifier(COMPONENT_FEATURE_FLAG_KEY),
                makeObjectExpression([
                    makeKeyValueProperty(makeIdentifier('value'), {
                        type: 'CallExpression',
                        callee: makeIdentifier('Boolean'),
                        arguments: [{ expression: featureFlagIdentifier }],
                        typeArguments: undefined,
                        span: DUMMY_SPAN,
                        ctxt: 0,
                    } as any),
                    makeKeyValueProperty(
                        makeIdentifier('path'),
                        makeStringLiteral(opts.componentFeatureFlagModulePath!)
                    ),
                ])
            )
        );
    }

    if (opts.enableSyntheticElementInternals === true) {
        properties.push(
            makeKeyValueProperty(
                makeIdentifier(SYNTHETIC_ELEMENT_INTERNALS_KEY),
                makeBooleanLiteral(true)
            )
        );
    }

    const registerComponentCall: Expression = {
        type: 'CallExpression',
        callee: makeIdentifier(registerComponentLocalName),
        arguments: [
            { expression: classNodeExpr },
            { expression: makeObjectExpression(properties) },
        ],
        typeArguments: undefined,
        span: DUMMY_SPAN,
        ctxt: 0,
    } as any;

    // const __lwc_component_class_internal = registerComponent(...)
    const varDecl: VariableDeclaration = {
        type: 'VariableDeclaration',
        kind: 'const',
        declare: false,
        declarations: [
            {
                type: 'VariableDeclarator',
                id: makeIdentifier(COMPONENT_CLASS_ID) as unknown as Pattern,
                init: registerComponentCall,
                definite: false,
                span: DUMMY_SPAN,
            } as VariableDeclarator,
        ],
        span: DUMMY_SPAN,
        ctxt: 0,
    } as any;

    // export default __lwc_component_class_internal
    const newExportDefault: ExportDefaultExpression = {
        type: 'ExportDefaultExpression',
        expression: makeIdentifier(COMPONENT_CLASS_ID),
        span: node.span,
    };

    const result: ModuleItem[] = [varDecl, newExportDefault];

    // Preserve the original class name as a module-level binding.
    //
    // When the source has `export default class Foo extends LightningElement { ... }` followed
    // by code like `Foo.someStaticProp = ...`, the Babel pipeline kept `Foo` as a named class
    // declaration at module scope. With the SWC transform, the class expression is nested
    // inside `registerComponent(registerDecorators(class Foo {...}))` and the name `Foo` is
    // only accessible as the class expression's own name — not as a module-level identifier.
    // This breaks any code after the export that references the class by name.
    //
    // Fix: if the class had a name and it differs from the internal variable name, emit
    //   const Foo = __lwc_component_class_internal;
    // so that subsequent references to `Foo` in the same module remain valid.
    //
    // Note: originalClassName must be captured before processClass transforms the decl into
    // a CallExpression (the class identifier is no longer accessible at that point).
    if (originalClassName && originalClassName !== COMPONENT_CLASS_ID) {
        const aliasDecl: VariableDeclaration = {
            type: 'VariableDeclaration',
            kind: 'const',
            declare: false,
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: makeIdentifier(originalClassName) as unknown as Pattern,
                    init: makeIdentifier(COMPONENT_CLASS_ID),
                    definite: false,
                    span: DUMMY_SPAN,
                } as VariableDeclarator,
            ],
            span: DUMMY_SPAN,
            ctxt: 0,
        } as any;
        result.push(aliasDecl);
    }

    return result;
}
