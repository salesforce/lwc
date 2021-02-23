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

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2,
};

function getPropertyBitmask(type) {
    switch (type) {
        case DECORATOR_TYPES.GETTER:
            return PUBLIC_PROP_BIT_MASK.GETTER;
        case DECORATOR_TYPES.SETTER:
            return PUBLIC_PROP_BIT_MASK.SETTER;
        default:
            return PUBLIC_PROP_BIT_MASK.PROPERTY;
    }
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
function validate(decorators) {
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
    const kind = decoratorPath.parent.kind || 'property';

    let type = kind;
    if (kind === 'get') {
        type = 'getter';
    } else if (kind === 'set') {
        type = 'setter';
    }

    return {
        decoratorName,
        propertyName,
        binding,
        path: decoratorPath,
        type,
    };
}

function isTrackDecorator(decoratorMeta) {
    return decoratorMeta.decoratorName === 'track';
}

function isApiDecorator(decoratorMeta) {
    return decoratorMeta.decoratorName === 'api';
}

/*
function computePublicPropsConfig(decorators) {
    return decorators.reduce((acc, { path, type }) => {
        const property = path.parentPath;
        const propertyName = property.get('key.name').node;

        if (!(propertyName in acc)) {
            acc[propertyName] = {};
        }

        acc[propertyName].config |= getPropertyBitmask(type);

        // With the latest decorator spec a decorator only need to be in one of the getter/setter pair
        // We need to add the proper bitmask for the sibling getter/setter if exists
        const siblingPair = getSiblingGetSetPair(property, propertyName, type);
        if (siblingPair) {
            acc[propertyName].config |= getPropertyBitmask(siblingPair.type);
        }

        return acc;
    }, {});
}
*/

function getSiblingGetSetPairType(propertyName, type, classBodyItems) {
    const siblingKind = type === DECORATOR_TYPES.GETTER ? 'set' : 'get';
    const siblingNode = classBodyItems.find((classBodyItem) => {
        const isClassMethod = classBodyItem.isClassMethod({ kind: siblingKind });
        const isSamePropertyName = classBodyItem.node.key.name === propertyName;
        return isClassMethod && isSamePropertyName;
    });
    if (siblingNode) {
        return siblingKind === 'get' ? DECORATOR_TYPES.GETTER : DECORATOR_TYPES.SETTER;
    }
}

function computePublicPropsConfig(publicPropertyMetas, classBodyItems) {
    return publicPropertyMetas.reduce((acc, { propertyName, type }) => {
        if (!(propertyName in acc)) {
            acc[propertyName] = {};
        }
        acc[propertyName].config |= getPropertyBitmask(type);

        if (type === DECORATOR_TYPES.GETTER || type === DECORATOR_TYPES.SETTER) {
            // With the latest decorator spec, only one of the getter/setter pair needs a decorator.
            // We need to add the proper bitmask for the sibling getter/setter if it exists.
            const pairType = getSiblingGetSetPairType(propertyName, type, classBodyItems);
            if (pairType) {
                acc[propertyName].config |= getPropertyBitmask(pairType);
            }
        }

        return acc;
    }, {});
}

function getMetadataObjectPropertyList(t, decoratorMetas, classBodyItems) {
    const list = [];

    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const config = trackDecoratorMetas.reduce((acc, meta) => {
            acc[meta.propertyName] = 1;
            return acc;
        }, {});
        list.push(t.objectProperty(t.identifier('track'), t.valueToNode(config)));
    }

    const apiDecoratorMetas = decoratorMetas.filter(isApiDecorator);
    if (apiDecoratorMetas.length) {
        const publicPropertyMetas = apiDecoratorMetas.filter(
            ({ type }) => type !== DECORATOR_TYPES.METHOD
        );
        if (publicPropertyMetas.length) {
            const propsConfig = computePublicPropsConfig(publicPropertyMetas, classBodyItems);
            list.push(t.objectProperty(t.identifier('publicProps'), t.valueToNode(propsConfig)));
        }

        const publicMethodMetas = apiDecoratorMetas.filter(
            ({ type }) => type === DECORATOR_TYPES.METHOD
        );
        if (publicMethodMetas.length) {
            const methodNames = publicMethodMetas.map(({ propertyName }) => propertyName);
            list.push(t.objectProperty(t.identifier('publicMethods'), t.valueToNode(methodNames)));
        }
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
    validate,
};
