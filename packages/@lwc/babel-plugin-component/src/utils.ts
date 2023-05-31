/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import lineColumn from 'line-column';
import { types } from '@babel/core';
import { NodePath } from '@babel/traverse';
import { CompilerMetrics, generateErrorMessage } from '@lwc/errors';
import { LWC_PACKAGE_ALIAS } from './constants';
import { DecoratorErrorOptions, ImportSpecifier } from './decorators/types';
import { LwcBabelPluginPass } from './types';

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

function incrementMetricCounter(metric: CompilerMetrics, state: LwcBabelPluginPass) {
    state.opts.instrumentation?.incrementCounter(metric);
}

export {
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    generateError,
    getEngineImportSpecifiers,
    incrementMetricCounter,
};
