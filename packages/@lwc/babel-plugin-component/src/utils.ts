/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import lineColumn from 'line-column';
import { DiagnosticLevel, generateCompilerDiagnostic, generateErrorMessage } from '@lwc/errors';
import { LWC_PACKAGE_ALIAS, LWC_PACKAGE_EXPORTS } from './constants';
import type { types, NodePath } from '@babel/core';
import type { CompilerMetrics } from '@lwc/errors';
import type { DecoratorErrorOptions, ImportSpecifier } from './decorators/types';
import type { LwcBabelPluginPass } from './types';

function isClassMethod(
    classMethod: NodePath<types.Node>,
    properties: { kind?: string; name?: string; static?: boolean } = {}
): classMethod is NodePath<types.ClassMethod> {
    const { kind = 'method', name } = properties;
    return (
        classMethod.isClassMethod({ kind }) &&
        (!name || classMethod.get('key').isIdentifier({ name })) &&
        (properties.static === undefined || classMethod.node.static === properties.static)
    );
}

function isGetterClassMethod(
    classMethod: NodePath<types.Node>,
    properties: { kind?: string; name?: string; static?: boolean } = {}
) {
    return isClassMethod(classMethod, {
        kind: 'get',
        name: properties.name,
        static: properties.static,
    });
}

function isSetterClassMethod(
    classMethod: NodePath<types.Node>,
    properties: { kind?: string; name?: string; static?: boolean } = {}
) {
    return isClassMethod(classMethod, {
        kind: 'set',
        name: properties.name,
        static: properties.static,
    });
}

function getEngineImportsStatements(path: NodePath): NodePath<types.ImportDeclaration>[] {
    const programPath = path.isProgram()
        ? path
        : (path.findParent((node) => node.isProgram()) as NodePath<types.Program>);

    return programPath.get('body').filter((node) => {
        const source = node.get('source') as NodePath<types.Node>;
        return node.isImportDeclaration() && source.isStringLiteral({ value: LWC_PACKAGE_ALIAS });
    }) as NodePath<types.ImportDeclaration>[];
}

function getEngineImportSpecifiers(path: NodePath): ImportSpecifier[] {
    const imports = getEngineImportsStatements(path);
    return (
        imports
            // Flat-map the specifier list for each import statement
            .flatMap((importStatement) => importStatement.get('specifiers'))
            // Skip ImportDefaultSpecifier and ImportNamespaceSpecifier
            .filter((specifier) => specifier.type === 'ImportSpecifier')
            // Get the list of specifiers with their name
            .map((specifier) => {
                const imported = (specifier.get('imported') as NodePath<types.Identifier>).node
                    .name;
                return { name: imported, path: specifier };
            })
    );
}

function normalizeLocation(source: NodePath<types.Node>) {
    const location = (source.node && (source.node.loc || (source.node as any)._loc)) || null;
    if (!location) {
        return null;
    }
    const code = source.hub.getCode();
    if (!code) {
        return {
            line: location.start.line,
            column: location.start.column,
        };
    }
    const lineFinder = lineColumn(code);
    const startOffset = lineFinder.toIndex(location.start.line, location.start.column + 1);
    const endOffset = lineFinder.toIndex(location.end.line, location.end.column) + 1;
    const length = endOffset - startOffset;
    return {
        line: location.start.line,
        column: location.start.column,
        start: startOffset,
        length,
    };
}

function generateError(
    source: NodePath<types.Node>,
    { errorInfo, messageArgs }: DecoratorErrorOptions,
    state: LwcBabelPluginPass
) {
    const message = generateErrorMessage(errorInfo, messageArgs);
    const error = source.buildCodeFrameError(message);

    (error as any).filename = state.filename;
    (error as any).loc = normalizeLocation(source);
    (error as any).lwcCode = errorInfo && errorInfo.code;
    return error;
}

function collectError(
    source: NodePath<types.Node>,
    { errorInfo, messageArgs }: DecoratorErrorOptions,
    state: LwcBabelPluginPass
) {
    const diagnostic = generateCompilerDiagnostic(
        errorInfo,
        {
            messageArgs,
            origin: {
                filename: state.filename,
                location: normalizeLocation(source) ?? undefined,
            },
        },
        true
    );

    if (diagnostic.level === DiagnosticLevel.Fatal) {
        throw generateError(source, { errorInfo, messageArgs }, state);
    }

    if (!(state.file.metadata as any).lwcErrors) {
        (state.file.metadata as any).lwcErrors = [];
    }
    (state.file.metadata as any).lwcErrors.push(diagnostic);
}

function handleError(
    source: NodePath<types.Node>,
    decoratorErrorOpts: DecoratorErrorOptions,
    state: LwcBabelPluginPass
) {
    if (isErrorRecoveryMode(state)) {
        collectError(source, decoratorErrorOpts, state);
    } else {
        throw generateError(source, decoratorErrorOpts, state);
    }
}

function incrementMetricCounter(metric: CompilerMetrics, state: LwcBabelPluginPass) {
    state.opts.instrumentation?.incrementCounter(metric);
}

function isErrorRecoveryMode(state: LwcBabelPluginPass): boolean {
    return state.file.opts?.parserOpts?.errorRecovery ?? false;
}

/**
 * Copies optional metadata properties between ClassMethod and ClassPrivateMethod nodes.
 * These properties are not accepted by the t.classMethod() / t.classPrivateMethod() builders,
 * so they must be transferred manually after node creation. Both the forward and reverse
 * private-method transforms use this to maintain round-trip parity.
 */
function copyMethodMetadata(
    source: types.ClassMethod | types.ClassPrivateMethod,
    target: types.ClassMethod | types.ClassPrivateMethod
): void {
    if (source.returnType != null) target.returnType = source.returnType;
    if (source.typeParameters != null) target.typeParameters = source.typeParameters;
    if (source.loc != null) target.loc = source.loc;
    if (source.abstract != null) target.abstract = source.abstract;
    if (source.access != null) target.access = source.access;
    if (source.accessibility != null) target.accessibility = source.accessibility;
    if (source.optional != null) target.optional = source.optional;
    if (source.override != null) target.override = source.override;
}

/**
 * Returns true if the given class path extends `Mosaic` imported from the `'lwc'` package.
 * Used to apply Mosaic-specific compilation rules (no template, no @wire, etc.).
 */
function isMosaic(classPath: NodePath): boolean {
    const node = classPath.node as types.Class;
    const superClass = node.superClass;
    if (!superClass || superClass.type !== 'Identifier') {
        return false;
    }
    const superName = (superClass as types.Identifier).name;
    const binding = classPath.scope.getBinding(superName);
    if (!binding) {
        return false;
    }
    const bindingPath = binding.path;
    if (!bindingPath.isImportSpecifier()) {
        return false;
    }
    const importDecl = bindingPath.parent as types.ImportDeclaration;
    if (importDecl.source.value !== LWC_PACKAGE_ALIAS) {
        return false;
    }
    const importedName = ((bindingPath.node as types.ImportSpecifier).imported as types.Identifier)
        .name;
    return importedName === LWC_PACKAGE_EXPORTS.MOSAIC_BASE_COMPONENT;
}

export {
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    getEngineImportSpecifiers,
    handleError,
    incrementMetricCounter,
    isErrorRecoveryMode,
    copyMethodMetadata,
    isMosaic,
};
