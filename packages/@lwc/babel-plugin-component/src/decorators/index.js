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

const { LWC_PACKAGE_ALIAS, DECORATOR_TYPES } = require('../constants');
const {
    generateError,
    getEngineImportSpecifiers,
    isClassMethod,
    isSetterClassMethod,
    isGetterClassMethod,
} = require('../utils');
const { isWireDecorator } = require('./wire/shared');

const DECORATOR_TRANSFORMS = [api, wire, track];
const AVAILABLE_DECORATORS = DECORATOR_TRANSFORMS.map((transform) => transform.name).join(', ');

function isLwcDecoratorName(name) {
    return DECORATOR_TRANSFORMS.some((transform) => transform.name === name);
}

/** Returns a list of all the references to an identifier */
function getReferences(identifier) {
    return identifier.scope.getBinding(identifier.node.name).referencePaths;
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
    const kind = decoratorPath.parent.kind || 'property';

    let type = kind;
    if (kind === 'get') {
        type = 'getter';
    } else if (kind === 'set') {
        type = 'setter';
    }

    return {
        name,
        propertyName,
        binding,
        path: decoratorPath,
        type,
    };
}

function isTrackDecorator(decoratorMeta) {
    return decoratorMeta.name === 'track';
}

function isApiDecorator(decoratorMeta) {
    return decoratorMeta.name === 'api';
}

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

    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const config = trackDecoratorMetas.reduce((acc, meta) => {
            acc[meta.propertyName] = 1;
            return acc;
        }, {});
        list.push(t.objectProperty(t.identifier('track'), t.valueToNode(config)));
    }

    const wireDecoratorMetas = decoratorMetas.filter(isWireDecorator);
    if (wireDecoratorMetas.length) {
        list.push(wire.transform(t, wireDecoratorMetas));
    }

    const fieldNames = classBodyItems
        .filter((field) => field.isClassProperty({ computed: false, static: false }))
        .filter((field) => !field.node.decorators)
        .map((field) => field.node.key.name);
    if (fieldNames.length) {
        list.push(t.objectProperty(t.identifier('fields'), t.valueToNode(fieldNames)));
    }

    return list;
}

function decorators() {
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
