/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const api = require('./api');
const wire = require('./wire');
const track = require('./track');

const { LWC_PACKAGE_ALIAS, DECORATOR_TYPES } = require('../constants');
const {
    generateError,
    getEngineImportSpecifiers,
    isClassMethod,
    isSetterClassMethod,
    isGetterClassMethod,
} = require('../utils');
const { DecoratorErrors } = require('@lwc/errors');

const DECORATOR_TRANSFORMS = [api, wire, track];
const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map((transform) => transform.name).join(', ');

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some((transform) => transform.name === name);
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

/** Returns a list of all the LWC decorators usages
function getLwcDecorators(importSpecifiers) {
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

            return {
                name,
                path: decorator,
                type: getDecoratorType(propertyOrMethod),
            };
        });
}
*/

/** Validate the usage of decorator by calling each validation function */
export function validate(decoratorMeta) {
    ({
        api,
        track,
        wire,
    }[decoratorMeta.decoratorName].validate(decoratorMeta));
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

export function generateInvalidDecoratorError(path) {
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
            acc.push(decorators[0]);
        }
        return acc;
    }, []);
}

function getDecoratorMetadata(decoratorPath) {
    const expressionPath = decoratorPath.get('expression');
    const decoratorName = expressionPath.isIdentifier()
        ? expressionPath.node.name
        : expressionPath.node.callee.name;
    const propertyName = decoratorPath.parent.key.name;
    const binding = decoratorPath.scope.getBinding(decoratorName);

    const meta = {
        decoratorName,
        propertyName,
        binding,
        path: decoratorPath,
    };

    validate(meta);

    return meta;
}

function isTrackDecorator(decoratorMeta) {
    return decoratorMeta.decoratorName === 'track';
}

function getMetadataObjectPropertyList(t, decoratorMetas) {
    const list = [];

    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const config = trackDecoratorMetas.reduce((acc, meta) => {
            acc[meta.propertyName] = 1;
            return acc;
        }, {});
        list.push(t.objectProperty(t.identifier('track'), t.valueToNode(config)));
    }

    return list;
}

function decorators() {
    return {
        Program: {
            exit(path) {
                const engineImportSpecifiers = getEngineImportSpecifiers(path);
                const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) =>
                    isLwcDecoratorName(name)
                );
                removeImportSpecifiers(decoratorImportSpecifiers);
            },
        },
    };
}
module.exports = {
    collectDecoratorPaths,
    decorators,
    getDecoratorMetadata,
    getDecoratorType,
    getMetadataObjectPropertyList,
};
