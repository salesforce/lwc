/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { DecoratorErrors } = require('@lwc/errors');

const api = require('./api');
const wire = require('./wire');
const track = require('./track');

const { DECORATOR_TYPES, LWC_PACKAGE_ALIAS, REGISTER_DECORATORS_ID } = require('../constants');
const {
    addNamedImport,
    generateError,
    getEngineImportSpecifiers,
    isClassMethod,
    isSetterClassMethod,
    isGetterClassMethod,
} = require('../utils');

const DECORATOR_TRANSFORMS = [api, wire, track];
const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map((transform) => transform.name).join(', ');

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some((transform) => transform.name === name);
}

/** Returns a list of all the references to an identifier */
function getReferences(identifier) {
    return identifier.scope.getBinding(identifier.node.name).referencePaths;
}

/** Returns the type of decorator depdending on the property or method if get applied to */
function getDecoratorType(propertyOrMethod) {
    if (isClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.METHOD;
    } else if (isGetterClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.GETTER;
    } else if (isSetterClassMethod(propertyOrMethod)) {
        return DECORATOR_TYPES.SETTER;
    } else if (propertyOrMethod.isClassProperty()) {
        return DECORATOR_TYPES.PROPERTY;
    } else {
        throw generateError(propertyOrMethod, {
            errorInfo: DecoratorErrors.INVALID_DECORATOR_TYPE,
        });
    }
}

function validateLwcDecorators(importSpecifiers) {
    return importSpecifiers
        .reduce((acc, { name, path }) => {
            // Get a list of all the  local references
            const local = path.get('imported');
            const references = getReferences(local).map((reference) => ({
                name,
                reference,
            }));

            return [...acc, ...references];
        }, [])
        .map(({ name, reference }) => {
            // Get the decorator from the identifier
            // If the the decorator is:
            //   - an identifier @track : the decorator is the parent of the identifier
            //   - a call expression @wire("foo") : the decorator is the grand-parent of the identifier
            const decorator = reference.parentPath.isDecorator()
                ? reference.parentPath
                : reference.parentPath.parentPath;

            if (!decorator.isDecorator()) {
                throw generateError(decorator, {
                    errorInfo: DecoratorErrors.IS_NOT_DECORATOR,
                    messageArgs: [name],
                });
            }

            const propertyOrMethod = decorator.parentPath;
            if (!propertyOrMethod.isClassProperty() && !propertyOrMethod.isClassMethod()) {
                throw generateError(propertyOrMethod, {
                    errorInfo: DecoratorErrors.IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD,
                    messageArgs: [name],
                });
            }
        });
}

function isImportedFromLwcSource(decoratorBinding) {
    const bindingPath = decoratorBinding.path;
    return bindingPath.isImportSpecifier() && bindingPath.parent.source.value === 'lwc';
}

/** Validate the usage of decorator by calling each validation function */
function validate(decorators) {
    for (const { binding, path } of decorators) {
        if (binding === undefined || !isImportedFromLwcSource(binding)) {
            throw generateInvalidDecoratorError(path);
        }
    }
    DECORATOR_TRANSFORMS.forEach(({ validate }) => validate(decorators));
}

/** Remove import specifiers. It also removes the import statement if the specifier list becomes empty */
function removeImportSpecifiers(specifiers) {
    for (const { path } of specifiers) {
        const importStatement = path.parentPath;
        path.remove();

        if (importStatement.get('specifiers').length === 0) {
            importStatement.remove();
        }
    }
}

function generateInvalidDecoratorError(path) {
    const expressionPath = path.get('expression');
    const { node } = path;
    const { expression } = node;

    let name;
    if (expressionPath.isIdentifier()) {
        name = expression.name;
    } else if (expressionPath.isCallExpression()) {
        name = expression.callee.name;
    }

    if (name) {
        return generateError(path.parentPath, {
            errorInfo: DecoratorErrors.INVALID_DECORATOR_WITH_NAME,
            messageArgs: [name, AVAILABLE_DECORATORS, LWC_PACKAGE_ALIAS],
        });
    } else {
        return generateError(path.parentPath, {
            errorInfo: DecoratorErrors.INVALID_DECORATOR,
            messageArgs: [AVAILABLE_DECORATORS, LWC_PACKAGE_ALIAS],
        });
    }
}

function collectDecoratorPaths(bodyItems) {
    return bodyItems.reduce((acc, bodyItem) => {
        const decorators = bodyItem.get('decorators');
        if (decorators && decorators.length) {
            acc.push(...decorators);
        }
        return acc;
    }, []);
}

function getDecoratorMetadata(decoratorPath) {
    const expressionPath = decoratorPath.get('expression');

    let name;
    if (expressionPath.isIdentifier()) {
        name = expressionPath.node.name;
    } else if (expressionPath.isCallExpression()) {
        name = expressionPath.node.callee.name;
    } else {
        throw generateInvalidDecoratorError(decoratorPath);
    }

    const propertyName = decoratorPath.parent.key.name;
    const binding = decoratorPath.scope.getBinding(name);
    const type = getDecoratorType(decoratorPath.parentPath);

    return {
        name,
        propertyName,
        binding,
        path: decoratorPath,
        type,
    };
}

function getMetadataObjectPropertyList(t, decoratorMetas, classBodyItems) {
    const list = [
        ...api.transform(t, decoratorMetas, classBodyItems),
        ...track.transform(t, decoratorMetas),
        ...wire.transform(t, decoratorMetas),
    ];

    const fieldNames = classBodyItems
        .filter((field) => field.isClassProperty({ computed: false, static: false }))
        .filter((field) => !field.node.decorators)
        .map((field) => field.node.key.name);
    if (fieldNames.length) {
        list.push(t.objectProperty(t.identifier('fields'), t.valueToNode(fieldNames)));
    }

    return list;
}

function decorators({ types: t }) {
    function createRegisterDecoratorsCall(path, classExpression, props) {
        const opts = path.opts;
        const id = addNamedImport(path, REGISTER_DECORATORS_ID, 'lwc');
        path.opts = opts;
        return t.callExpression(id, [classExpression, t.objectExpression(props)]);
    }

    // Babel reinvokes visitors for node reinsertion so we use this to avoid an infinite loop.
    const visitedClasses = new WeakSet();

    return {
        Program: {
            enter(path, state) {
                const engineImportSpecifiers = getEngineImportSpecifiers(path);
                state.decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) =>
                    isLwcDecoratorName(name)
                );
                validateLwcDecorators(state.decoratorImportSpecifiers);
            },
            exit(path, state) {
                removeImportSpecifiers(state.decoratorImportSpecifiers);
                state.decoratorImportSpecifiers = [];
            },
        },
        Class(path) {
            const { node } = path;

            if (visitedClasses.has(node)) {
                return;
            }
            visitedClasses.add(node);

            const classBodyItems = path.get('body.body');
            if (classBodyItems.length === 0) {
                return;
            }

            const decoratorPaths = collectDecoratorPaths(classBodyItems);
            const decoratorMetas = decoratorPaths.map(getDecoratorMetadata);

            validate(decoratorMetas);

            const metaPropertyList = getMetadataObjectPropertyList(
                t,
                decoratorMetas,
                classBodyItems
            );

            if (metaPropertyList.length === 0) {
                return;
            }

            const isAnonymousClassDeclaration =
                path.isClassDeclaration() && !path.get('id').isIdentifier();
            const shouldTransformAsClassExpression =
                path.isClassExpression() || isAnonymousClassDeclaration;

            if (shouldTransformAsClassExpression) {
                const classExpression = t.toExpression(node);
                path.replaceWith(
                    createRegisterDecoratorsCall(path, classExpression, metaPropertyList)
                );
            } else {
                const statementPath = path.getStatementParent();
                statementPath.insertAfter(
                    createRegisterDecoratorsCall(path, node.id, metaPropertyList)
                );
            }
        },
    };
}

module.exports = {
    decorators,
};
