/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { LWC_PACKAGE_ALIAS, LWC_PACKAGE_EXPORTS } = require('./constants');
const { LWCClassErrors, generateErrorMessage } = require('@lwc/errors');

const EXPORT_ALL_DECLARATION = 'ExportAllDeclaration';
const EXPORT_DEFAULT_DECLARATION = 'ExportDefaultDeclaration';
const EXPORT_NAMED_DECLARATION = 'ExportNamedDeclaration';

function findClassMethod(path, name, properties = {}) {
    path.assertClassBody();

    return path.get('body').find(path => (
        isClassMethod(path, {
            name,
            kind: properties.kind || 'method',
            static: properties.static
        })
    ));
}

function isClassMethod(classMethod, properties = {}) {
    const { kind = 'method', name } = properties;
    return classMethod.isClassMethod({ kind }) &&
           (!name || classMethod.get('key').isIdentifier({ name })) &&
           (properties.static === undefined || classMethod.node.static === properties.static);
}

function isGetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'get',
        name: properties.name,
        static: properties.static
    });
}

function isSetterClassMethod(classMethod, properties = {}) {
    return isClassMethod(classMethod, {
        kind: 'set',
        name: properties.name,
        static: properties.static
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
        return node.isImportDeclaration() && (source.isStringLiteral({ value: LWC_PACKAGE_ALIAS }))
    });
}

function getExportedNames(path) {
    const programPath = path.isProgram() ? path : path.findParent(node => node.isProgram());

    return exports = programPath.get('body').reduce((names, node) => {
        const exportSource = getExportSrc(node && node.node.source);

        // export default class App {}
        if (node.isExportDefaultDeclaration()) {
            names.push(createModuleExportInfo({ type: EXPORT_DEFAULT_DECLARATION, source: exportSource }));

        // export * from 'external-module'
        } else if (node.isExportDeclaration() && node.type === EXPORT_ALL_DECLARATION) {
            names.push(createModuleExportInfo({ type: EXPORT_ALL_DECLARATION, source: exportSource }));

        } else if (node.isExportDeclaration() && node.type === EXPORT_NAMED_DECLARATION) {

            // export { method } from 'utils'
            const specifiers = node.node.specifiers;

            if (Array.isArray(specifiers)) {
                specifiers.forEach(specifier => {
                    const exportValue = specifier.exported.name;
                    names.push(createModuleExportInfo({
                        type: EXPORT_NAMED_DECLARATION,
                        value: exportValue,
                        source: exportSource
                    }));
                });
            }

            const declaration = node.node.declaration;
            if (declaration) {

                // export const version = 0;
                if (declaration.type === 'VariableDeclaration' && Array.isArray(declaration.declarations)) {
                    declaration.declarations.forEach(nameDeclaration => {
                        exportValue = nameDeclaration.id.name;
                    });

                // export class Inner {};
                } else if (declaration.type === 'ClassDeclaration'
                    || declaration.type === 'FunctionDeclaration') {
                        exportValue = declaration.id.name;
                }

                names.push(createModuleExportInfo({
                    type: EXPORT_NAMED_DECLARATION,
                    value: exportValue,
                    source: exportSource
                }));
            }
        }
        return names;
    }, []);

}

function getExportSrc(src) {
    if (!src || !src.value) {
        return null;
    }
    const value = src.value;

    // only return source value for non-relative imports
    return  (!value.startsWith('./') && !value.startsWith('../')) ? value : null;
}

function createModuleExportInfo({ type, value, source }) {
    const moduleExport = { type };
    if (value) {
        moduleExport.value = value;
    }
    if (source) {
        moduleExport.source = source;
    }

    return moduleExport;
}

function getEngineImportSpecifiers(path) {
    const imports = getEngineImportsStatements(path);

    return imports.reduce((acc, importStatement) => {
        // Flat-map the specifier list for each import statement
        return [...acc, ...importStatement.get('specifiers')];
    }, []).reduce((acc, specifier) => {
        // Validate engine import specifier
        if (specifier.isImportNamespaceSpecifier()) {
            throw generateError(specifier, {
                errorInfo: LWCClassErrors.INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED,
                messageArgs: [LWC_PACKAGE_ALIAS, LWC_PACKAGE_EXPORTS.BASE_COMPONENT, LWC_PACKAGE_ALIAS]
            });
        } else if (specifier.isImportDefaultSpecifier()) {
            throw generateError(specifier, {
                errorInfo: LWCClassErrors.INVALID_IMPORT_MISSING_DEFAULT_EXPORT,
                messageArgs: [LWC_PACKAGE_ALIAS]
            });
        }

        // Get the list of specifiers with their name
        const imported = specifier.get('imported').node.name;
        return [...acc, { name: imported, path: specifier }];
    }, []);
}

function isComponentClass(classPath, componentBaseClassImports) {
    const superClass = classPath.get('superClass');

    return superClass.isIdentifier() && componentBaseClassImports
        && componentBaseClassImports.some(componentBaseClassImport => (
            classPath.scope.bindingIdentifierEquals(
                superClass.node.name,
                componentBaseClassImport.node
            )
        ));
}

function isDefaultExport(path) {
    return path.parentPath.isExportDefaultDeclaration();
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

function extractValueMetadata(valueNode) {

    let valueMetadata = {
        type: 'unresolved',
        value: undefined,
    };

    if (!valueNode) {
        return valueMetadata;
    }

    const { type } = valueNode;

    if (type === 'StringLiteral') {
        valueMetadata = extractStringValueMeta(valueNode);
    } else if (type === 'NumericLiteral') {
        valueMetadata = extractNumberValueMeta(valueNode);
    } else if (type === 'BooleanLiteral') {
        valueMetadata = extractBooleanValueMeta(valueNode);
    } else if (type === 'NullLiteral') {
        valueMetadata = {
            type: "null",
            value: null,
        };
    } else if (type === 'ObjectExpression') {
        valueMetadata = extractObjectValueMeta(valueNode);
    } else if (type === 'ArrayExpression') {
        valueMetadata = extractArrayValueMeta(valueNode);
    }

    return valueMetadata;
}

function extractStringValueMeta(valueNode) {
    return {
        type: 'string',
        value: valueNode && valueNode.value || undefined,
    }
}

function extractNumberValueMeta(valueNode) {
    let value = valueNode && valueNode.value;
    return {
        type: 'number',
        value: value === null ? undefined : value
    }
}

function extractBooleanValueMeta(valueNode) {
    let value = valueNode && valueNode.value;
    return {
        type: 'boolean',
        value: !!(valueNode && valueNode.value),
    }
}

function extractArrayValueMeta(valueNode) {
    const arrayValueMeta = {
        type: 'array',
        value: [],
    }

    if (!valueNode) {
        return arrayValueMeta;
    }

    return {
        type: 'array',
        value: valueNode.elements.map((elem) => extractValueMetadata(elem)),
    }
}

function extractObjectValueMeta(valueNode) {
    const objectValueMeta = {
        type: 'object',
        value: {},
    }

    if (!valueNode) {
        return objectValueMeta;
    }

    const values = {};

    valueNode.properties.forEach(({key, value}) => {
        values[key.name] = extractValueMetadata(value);
    });

    return {
        type: 'object',
        value: values,
    }
}

module.exports = {
    isLWCNode,
    markAsLWCNode,
    findClassMethod,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    staticClassProperty,
    getEngineImportSpecifiers,
    generateError,
    isComponentClass,
    isDefaultExport,
    getExportedNames,
    extractValueMetadata,
};
