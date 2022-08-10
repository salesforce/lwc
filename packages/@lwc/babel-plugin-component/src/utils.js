/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { generateErrorMessage } = require('@lwc/errors');
const lineColumn = require('line-column');

const { LWC_PACKAGE_ALIAS } = require('./constants');

function isClassMethod(classMethod, properties = {}) {
    const { kind = 'method', name } = properties;
    return (
        classMethod.isClassMethod({ kind }) &&
        (!name || classMethod.get('key').isIdentifier({ name })) &&
        (properties.static === undefined || classMethod.node.static === properties.static)
    );
}

function isGetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'get',
        name: properties.name,
        static: properties.static,
    });
}

function isSetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'set',
        name: properties.name,
        static: properties.static,
    });
}

function staticClassProperty(types, name, expression) {
    const classProperty = types.classProperty(types.identifier(name), expression);
    classProperty.static = true;
    return classProperty;
}

function getEngineImportsStatements(path) {
    const programPath = path.isProgram() ? path : path.findParent((node) => node.isProgram());

    return programPath.get('body').filter((node) => {
        const source = node.get('source');
        return node.isImportDeclaration() && source.isStringLiteral({ value: LWC_PACKAGE_ALIAS });
    });
}

function getEngineImportSpecifiers(path) {
    const imports = getEngineImportsStatements(path);
    return (
        imports
            // Flat-map the specifier list for each import statement
            .flatMap((importStatement) => importStatement.get('specifiers'))
            // Skip ImportDefaultSpecifier and ImportNamespaceSpecifier
            .filter((specifier) => specifier.type === 'ImportSpecifier')
            // Get the list of specifiers with their name
            .map((specifier) => {
                const imported = specifier.get('imported').node.name;
                return { name: imported, path: specifier };
            })
    );
}

function normalizeFilename(source) {
    return (
        (source.hub && source.hub.file && source.hub.file.opts && source.hub.file.opts.filename) ||
        null
    );
}

function normalizeLocation(source) {
    const location = (source.node && (source.node.loc || source.node._loc)) || null;
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

function generateError(source, { errorInfo, messageArgs } = {}) {
    const message = generateErrorMessage(errorInfo, messageArgs);
    const error = source.buildCodeFrameError(message);

    error.filename = normalizeFilename(source);
    error.loc = normalizeLocation(source);
    error.lwcCode = errorInfo && errorInfo.code;
    return error;
}

module.exports = {
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    generateError,
    getEngineImportSpecifiers,
    staticClassProperty,
};
