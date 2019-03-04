/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { LWC_PACKAGE_ALIAS, LWC_PACKAGE_EXPORTS } = require('./constants');
const { LWCClassErrors, generateErrorMessage } = require('@lwc/errors');

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
    const programPath = path.isProgram() ? path : path.findParent(node => node.isProgram());

    return programPath.get('body').filter(node => {
        const source = node.get('source');
        return node.isImportDeclaration() && source.isStringLiteral({ value: LWC_PACKAGE_ALIAS });
    });
}

function getEngineImportSpecifiers(path) {
    const imports = getEngineImportsStatements(path);

    return imports
        .reduce((acc, importStatement) => {
            // Flat-map the specifier list for each import statement
            return [...acc, ...importStatement.get('specifiers')];
        }, [])
        .reduce((acc, specifier) => {
            // Validate engine import specifier
            if (specifier.isImportNamespaceSpecifier()) {
                throw generateError(specifier, {
                    errorInfo: LWCClassErrors.INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED,
                    messageArgs: [
                        LWC_PACKAGE_ALIAS,
                        LWC_PACKAGE_EXPORTS.BASE_COMPONENT,
                        LWC_PACKAGE_ALIAS,
                    ],
                });
            } else if (specifier.isImportDefaultSpecifier()) {
                throw generateError(specifier, {
                    errorInfo: LWCClassErrors.INVALID_IMPORT_MISSING_DEFAULT_EXPORT,
                    messageArgs: [LWC_PACKAGE_ALIAS],
                });
            }

            // Get the list of specifiers with their name
            const imported = specifier.get('imported').node.name;
            return [...acc, { name: imported, path: specifier }];
        }, []);
}

function generateError(source, { errorInfo, messageArgs } = {}) {
    const message = generateErrorMessage(errorInfo, messageArgs);
    const error = source.buildCodeFrameError(message);

    error.lwcCode = errorInfo && errorInfo.code;
    return error;
}

function isLWCNode(node) {
    return node._lwcNode === true;
}

function markAsLWCNode(node) {
    node._lwcNode = true;
}

module.exports = {
    isLWCNode,
    markAsLWCNode,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    staticClassProperty,
    getEngineImportSpecifiers,
    generateError,
};
