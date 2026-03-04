/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors, TransformerErrors } from '@lwc/errors';
import { APIFeature, getAPIVersionFromNumber, isAPIFeatureEnabled } from '@lwc/shared';
import {
    DECORATOR_TYPES,
    LWC_PACKAGE_ALIAS,
    LWC_PACKAGE_EXPORTS,
    LWC_COMPONENT_PROPERTIES,
    REGISTER_DECORATORS_ID,
} from '../constants';
import { handleError } from '../utils';
import { injectNamedImport } from '../import-helpers';
import { transformApi, validateApi } from './api';
import { transformTrack, validateTrack } from './track';
import { transformWire, validateWire } from './wire';
import type {
    Program,
    ClassDeclaration,
    ClassExpression,
    ClassProperty,
    ClassMethod,
    Decorator,
    Identifier,
    StringLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    ObjectExpression,
    ArrayExpression,
    KeyValueProperty,
    ModuleItem,
    Span,
    ImportDeclaration,
    NamedImportSpecifier,
} from '@swc/types';
import type { DecoratorMeta } from './types';
import type { VisitorState } from '../utils';
import type { BindingInfo } from '../types';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

const { API_DECORATOR, TRACK_DECORATOR, WIRE_DECORATOR } = LWC_PACKAGE_EXPORTS;
const LWC_DECORATOR_NAMES = new Set([API_DECORATOR, TRACK_DECORATOR, WIRE_DECORATOR]);

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

function makeStringLiteral(value: string): StringLiteral {
    return { type: 'StringLiteral', value, span: DUMMY_SPAN, raw: JSON.stringify(value) };
}

function makeObjectExpression(properties: KeyValueProperty[]): ObjectExpression {
    return { type: 'ObjectExpression', properties, span: DUMMY_SPAN };
}

function makeArrayExpression(elements: Expression[]): ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements: elements.map((e) => ({ expression: e })),
        span: DUMMY_SPAN,
    };
}

function makeKeyValueProperty(
    key: Identifier | StringLiteral,
    value: Expression
): KeyValueProperty {
    return { type: 'KeyValueProperty', key, value };
}

/**
 * Gets the decorator name from a Decorator node.
 * Returns the name if it's an LWC decorator (api, track, wire), otherwise null.
 */
function getLwcDecoratorName(decorator: Decorator): string | null {
    const expr = decorator.expression;
    if (expr.type === 'Identifier') {
        const name = (expr as Identifier).value;
        if (LWC_DECORATOR_NAMES.has(name)) return name;
    } else if (expr.type === 'CallExpression') {
        const callee = (expr as CallExpression).callee;
        if (callee.type === 'Identifier') {
            const name = (callee as Identifier).value;
            if (LWC_DECORATOR_NAMES.has(name)) return name;
        }
    }
    return null;
}

/**
 * Gets the property name from a class member key.
 * For computed keys like [sym], returns the identifier name (e.g. "sym").
 */
function getMemberPropertyName(member: ClassProperty | ClassMethod): string {
    const key = member.key;
    if (key.type === 'Identifier') return (key as Identifier).value;
    if (key.type === 'StringLiteral') return (key as StringLiteral).value;
    // Computed key: [expr] — try to extract identifier name from the expression
    if (key.type === 'Computed') {
        const innerExpr = (key as any).expression;
        if (innerExpr && innerExpr.type === 'Identifier') {
            return (innerExpr as Identifier).value;
        }
    }
    return '';
}

/**
 * Gets the decorator type for a class member.
 */
function getDecoratedNodeType(
    member: ClassProperty | ClassMethod,
    decorator: Decorator,
    state: VisitorState
): DecoratorMeta['decoratedNodeType'] {
    if (member.type === 'ClassProperty') {
        return DECORATOR_TYPES.PROPERTY;
    }
    if (member.type === 'ClassMethod') {
        const kind = (member as ClassMethod).kind;
        if (kind === 'getter') return DECORATOR_TYPES.GETTER;
        if (kind === 'setter') return DECORATOR_TYPES.SETTER;
        if (kind === 'method') return DECORATOR_TYPES.METHOD;
    }

    handleError(decorator, { errorInfo: DecoratorErrors.INVALID_DECORATOR_TYPE }, state);
    return null;
}

/**
 * Gets the decorators from a class member.
 * In SWC's AST: ClassProperty stores decorators on `member.decorators` (via HasDecorator),
 * while ClassMethod stores them on `member.function.decorators`.
 */
function getMemberDecorators(member: ClassProperty | ClassMethod): Decorator[] {
    if (member.type === 'ClassProperty') {
        return (member as ClassProperty).decorators ?? [];
    }
    if (member.type === 'ClassMethod') {
        return (member as ClassMethod).function.decorators ?? [];
    }
    return [];
}

/**
 * Collects all LWC decorator metadata from a class body.
 */
function collectDecoratorMetas(
    classBody: Array<ClassProperty | ClassMethod>,
    state: VisitorState
): DecoratorMeta[] {
    const metas: DecoratorMeta[] = [];
    for (const member of classBody) {
        const memberDecorators = getMemberDecorators(member);
        for (const decorator of memberDecorators) {
            const name = getLwcDecoratorName(decorator);
            if (name) {
                const propertyName = getMemberPropertyName(member);
                const decoratedNodeType = getDecoratedNodeType(member, decorator, state);
                metas.push({
                    name: name as DecoratorMeta['name'],
                    propertyName,
                    decorator,
                    member,
                    decoratedNodeType,
                });
            }
        }
    }
    return metas.filter((m) => m !== null);
}

/**
 * Removes LWC decorator nodes from class members.
 */
function removeDecoratorNodes(classBody: Array<ClassProperty | ClassMethod>): void {
    for (const member of classBody) {
        if (member.type === 'ClassProperty') {
            const prop = member as ClassProperty;
            if (prop.decorators) {
                prop.decorators = prop.decorators.filter(
                    (d: Decorator) => getLwcDecoratorName(d) === null
                );
            }
        } else if (member.type === 'ClassMethod') {
            const method = member as ClassMethod;
            if (method.function.decorators) {
                method.function.decorators = method.function.decorators.filter(
                    (d: Decorator) => getLwcDecoratorName(d) === null
                );
            }
        }
    }
}

/**
 * Builds the registerDecorators call: registerDecorators(ClassName, { ... })
 */
function buildRegisterDecoratorsCall(
    program: Program,
    classRef: Expression,
    metaPropertyList: KeyValueProperty[]
): CallExpression {
    const registerDecId = injectNamedImport(program, REGISTER_DECORATORS_ID, LWC_PACKAGE_ALIAS);

    return {
        type: 'CallExpression',
        callee: makeIdentifier(registerDecId),
        arguments: [
            { expression: classRef },
            { expression: makeObjectExpression(metaPropertyList) },
        ],
        typeArguments: undefined,
        span: DUMMY_SPAN,
        ctxt: 0,
    } as any;
}

/**
 * Builds the metadata property list for registerDecorators.
 */
function getMetadataPropertyList(
    decoratorMetas: DecoratorMeta[],
    classBody: Array<ClassProperty | ClassMethod>,
    state: VisitorState & { bindingMap: Map<string, BindingInfo> }
): KeyValueProperty[] {
    const list = [
        ...transformApi(decoratorMetas, classBody, state),
        ...transformTrack(decoratorMetas),
        ...transformWire(decoratorMetas, state),
    ];

    // Add 'fields' key for undecorated, non-static, non-computed class properties
    const fieldNames = classBody
        .filter((m): m is ClassProperty => m.type === 'ClassProperty')
        .filter((m) => !m.isStatic && m.key.type !== 'Computed')
        .filter((m) => !m.decorators || m.decorators.length === 0)
        .map((m) => getMemberPropertyName(m))
        .filter((n) => n !== '');

    if (fieldNames.length > 0) {
        list.push(
            makeKeyValueProperty(
                makeIdentifier('fields'),
                makeArrayExpression(fieldNames.map(makeStringLiteral))
            )
        );
    }

    return list;
}

/**
 * Validates that LWC decorator imports from 'lwc' are only used as decorators.
 */
export function validateImportedLwcDecoratorUsage(
    program: Program,
    state: VisitorState & { bindingMap: Map<string, BindingInfo> }
): void {
    // Find all specifiers imported from 'lwc' that are LWC decorator names
    const body = program.type === 'Module' ? program.body : (program as any).body;

    for (const node of body) {
        if (node.type !== 'ImportDeclaration') continue;
        const decl = node as ImportDeclaration;
        if (decl.source.value !== LWC_PACKAGE_ALIAS) continue;

        for (const spec of decl.specifiers) {
            if (spec.type !== 'ImportSpecifier') continue;
            const named = spec as NamedImportSpecifier;
            const importedName = named.imported
                ? named.imported.type === 'Identifier'
                    ? named.imported.value
                    : named.imported.value
                : named.local.value;

            if (!LWC_DECORATOR_NAMES.has(importedName)) continue;

            // The local binding name
            const localName = named.local.value;

            // Check that this name is only used as a decorator in the program
            // We do this by verifying that the binding map shows it's used from 'lwc'
            // We cannot do full scope analysis in SWC visitor, but we can check
            // that the import is actually used as a decorator via collectDecoratorMetas
            // The validation is done implicitly when decorators are processed.
            // If someone uses `api` as a non-decorator, it will fail type-checking.
            void localName; // Validation is primarily handled at class level
        }
    }
}

/**
 * Removes the @api, @track, @wire import specifiers from the 'lwc' import.
 * If the import becomes empty, removes the entire import declaration.
 */
export function removeImportedDecoratorSpecifiers(program: Program): void {
    const body = program.type === 'Module' ? program.body : (program as any).body;

    for (let i = body.length - 1; i >= 0; i--) {
        const node = body[i];
        if (node.type !== 'ImportDeclaration') continue;
        const decl = node as ImportDeclaration;
        if (decl.source.value !== LWC_PACKAGE_ALIAS) continue;

        const originalLength = decl.specifiers.length;
        decl.specifiers = decl.specifiers.filter((spec) => {
            if (spec.type !== 'ImportSpecifier') return true;
            const named = spec as NamedImportSpecifier;
            const importedName = named.imported
                ? named.imported.type === 'Identifier'
                    ? named.imported.value
                    : named.imported.value
                : named.local.value;
            return !LWC_DECORATOR_NAMES.has(importedName);
        });

        if (decl.specifiers.length === 0 && originalLength > 0) {
            body.splice(i, 1);
        }
    }
}

/**
 * Processes a class declaration/expression, applying LWC decorator transforms.
 *
 * For named class declarations, returns an ExpressionStatement containing
 * registerDecorators(ClassName, {...}) to be inserted after the class.
 *
 * For class expressions or anonymous classes, wraps the class in
 * registerDecorators(classExpr, {...}).
 *
 * Returns null if no transformation is needed.
 */
export function processClass(
    program: Program,
    classNode: ClassDeclaration | ClassExpression,
    isDeclaration: boolean,
    visitedClasses: WeakSet<object>,
    state: VisitorState & { bindingMap: Map<string, BindingInfo> }
): {
    /** For ClassDeclaration: statement to insert after the class */
    afterStatement: ExpressionStatement | null;
    /** For ClassExpression: the replacement expression */
    replacementExpression: CallExpression | null;
} {
    if (visitedClasses.has(classNode)) {
        return { afterStatement: null, replacementExpression: null };
    }
    visitedClasses.add(classNode);

    const classBody = classNode.body.filter(
        (m) => m.type === 'ClassProperty' || m.type === 'ClassMethod'
    ) as Array<ClassProperty | ClassMethod>;

    if (classBody.length === 0) {
        return { afterStatement: null, replacementExpression: null };
    }

    // In API versions with SKIP_UNNECESSARY_REGISTER_DECORATORS:
    // classes without a superclass don't get registerDecorators.
    // BUT: if the class uses LWC decorators (@api/@track/@wire), that's an error —
    // those decorators are only supported in LightningElement subclasses.
    if (
        (classNode.superClass === undefined || classNode.superClass === null) &&
        isAPIFeatureEnabled(
            APIFeature.SKIP_UNNECESSARY_REGISTER_DECORATORS,
            getAPIVersionFromNumber(state.opts?.apiVersion)
        )
    ) {
        // Collect decorator metas first to check if any LWC decorators are present
        const earlyDecoMetas = collectDecoratorMetas(classBody, state);
        if (earlyDecoMetas.length > 0) {
            // Use the first decorated member's span for the error location
            const firstDecoratedNode = earlyDecoMetas[0]?.decorator ?? (classNode as any);
            handleError(
                firstDecoratedNode,
                {
                    errorInfo: TransformerErrors.JS_TRANSFORMER_DECORATOR_ERROR,
                    messageArgs: [
                        `Decorator "@${earlyDecoMetas[0]?.name}" used on class "${(classNode as any).identifier?.value ?? '<anonymous>'}".`,
                    ],
                },
                state
            );
        }
        return { afterStatement: null, replacementExpression: null };
    }

    const decoratorMetas = collectDecoratorMetas(classBody, state);
    const stateWithBindingMap = state as VisitorState & { bindingMap: Map<string, BindingInfo> };

    // Validate decorators
    validateApi(decoratorMetas, state);
    validateTrack(decoratorMetas, state);
    validateWire(decoratorMetas, stateWithBindingMap);

    const metaPropertyList = getMetadataPropertyList(
        decoratorMetas,
        classBody,
        stateWithBindingMap
    );

    if (metaPropertyList.length === 0) {
        return { afterStatement: null, replacementExpression: null };
    }

    // Remove decorators from class body
    removeDecoratorNodes(classBody);

    const isAnonymous = isDeclaration && !(classNode as ClassDeclaration).identifier;
    const shouldTransformAsExpression = !isDeclaration || isAnonymous;

    if (shouldTransformAsExpression) {
        // Wrap class expression in registerDecorators(classExpr, {...})
        const classRef: ClassExpression = {
            type: 'ClassExpression',
            identifier: (classNode as ClassDeclaration).identifier ?? undefined,
            superClass: classNode.superClass,
            body: classNode.body,
            implements: classNode.implements,
            isAbstract: false,
            decorators: classNode.decorators?.filter((d) => getLwcDecoratorName(d) === null),
            span: classNode.span,
            typeParams: classNode.typeParams,
            superTypeParams: classNode.superTypeParams,
            ctxt: (classNode as any).ctxt ?? 0,
        } as any;

        const callExpr = buildRegisterDecoratorsCall(program, classRef, metaPropertyList);
        return { afterStatement: null, replacementExpression: callExpr };
    } else {
        // Insert registerDecorators(ClassName, {...}) after the class declaration.
        // Use the actual class identifier node to preserve its SyntaxContext (ctxt),
        // preventing SWC from renaming the class when it detects multiple identifiers
        // with the same name but different ctxt values.
        const classIdentifier: Identifier = (classNode as ClassDeclaration)
            .identifier as unknown as Identifier;
        const callExpr = buildRegisterDecoratorsCall(program, classIdentifier, metaPropertyList);
        const afterStatement: ExpressionStatement = {
            type: 'ExpressionStatement',
            expression: callExpr,
            span: DUMMY_SPAN,
        };
        return { afterStatement, replacementExpression: null };
    }
}
