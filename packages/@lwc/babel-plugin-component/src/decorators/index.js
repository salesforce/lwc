/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const api = require('./api');
const wire = require('./wire');
const track = require('./track');

const { LWC_PACKAGE_ALIAS, DECORATOR_TYPES, LWC_DECORATORS } = require('../constants');
const {
    generateError,
    getEngineImportSpecifiers,
    isClassMethod,
    isSetterClassMethod,
    isGetterClassMethod,
} = require('../utils');
const { DecoratorErrors } = require('@lwc/errors');

const DECORATOR_TRANSFORMS = [api, wire, track];

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some(transform => transform.name === name);
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

/** Returns a list of all the LWC decorators usages */
function getLwcDecorators(importSpecifiers) {
    return importSpecifiers
        .reduce((acc, { name, path }) => {
            // Get a list of all the  local references
            const local = path.get('imported');
            const references = getReferences(local).map(reference => ({
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

            return {
                name,
                path: decorator,
                type: getDecoratorType(propertyOrMethod),
            };
        });
}

/** Group decorator per class */
function groupDecorator(decorators) {
    return decorators.reduce((acc, decorator) => {
        const classPath = decorator.path.findParent(node => node.isClass());

        if (acc.has(classPath)) {
            acc.set(classPath, [...acc.get(classPath), decorator]);
        } else {
            acc.set(classPath, [decorator]);
        }

        return acc;
    }, new Map());
}

/** Validate the usage of decorator by calling each validation function */
function validate(klass, decorators) {
    DECORATOR_TRANSFORMS.forEach(({ validate }) => validate(klass, decorators));
}

/** Transform the decorators */
function transform(t, klass, decorators) {
    return DECORATOR_TRANSFORMS.forEach(({ transform }) => {
        transform(t, klass, decorators);
    });
}

/** Remove all the decorators */
function removeDecorators(decorators) {
    for (const { path } of decorators) {
        path.remove();
    }
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

function invalidDecorators() {
    return {
        Decorator(path) {
            throw generateError(path.parentPath, {
                errorInfo: DecoratorErrors.INVALID_DECORATOR_WITH_NAME,
                messageArgs: [
                    path.node.expression.name,
                    LWC_DECORATORS.join(', '),
                    LWC_PACKAGE_ALIAS,
                ],
            });
        },
    };
}

function decorators({ types: t }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);
            const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) =>
                isLwcDecoratorName(name)
            );

            const decorators = getLwcDecorators(decoratorImportSpecifiers);
            const grouped = groupDecorator(decorators);

            for (const [klass, decorators] of grouped) {
                validate(klass, decorators);
                transform(t, klass, decorators);
            }

            state.decorators = decorators;
            state.decoratorImportSpecifiers = decoratorImportSpecifiers;
        },

        Class(path, state) {
            removeDecorators(state.decorators);
            removeImportSpecifiers(state.decoratorImportSpecifiers);
            state.decorators = [];
            state.decoratorImportSpecifiers = [];
        },

        Decorator(path) {
            const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map(transform => transform.name);

            throw generateError(path.parentPath, {
                errorInfo: DecoratorErrors.INVALID_DECORATOR,
                messageArgs: [AVAILABLE_DECORATORS.join(', '), LWC_PACKAGE_ALIAS],
            });
        },
    };
}
module.exports = {
    decorators,
    invalidDecorators,
};
