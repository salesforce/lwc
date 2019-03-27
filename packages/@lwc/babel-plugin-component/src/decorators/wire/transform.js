/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isWireDecorator } = require('./shared');
const { staticClassProperty, markAsLWCNode } = require('../../utils');
const { LWC_COMPONENT_PROPERTIES } = require('../../constants');

const WIRE_PARAM_PREFIX = '$';

function isObservedProperty(configProperty) {
    const propertyValue = configProperty.get('value');
    return (
        propertyValue.isStringLiteral() && propertyValue.node.value.startsWith(WIRE_PARAM_PREFIX)
    );
}

function getWiredStatic(wireConfig) {
    return wireConfig
        .get('properties')
        .filter(property => !isObservedProperty(property))
        .map(path => path.node);
}

function getWiredParams(t, wireConfig) {
    return wireConfig
        .get('properties')
        .filter(property => isObservedProperty(property))
        .map(path => {
            // Need to clone deep the observed property to remove the param prefix
            const clonedProperty = t.cloneDeep(path.node);
            clonedProperty.value.value = clonedProperty.value.value.slice(1);

            return clonedProperty;
        });
}

function buildWireConfigValue(t, wiredValues) {
    return t.objectExpression(
        wiredValues.map(wiredValue => {
            const wireConfig = [];
            if (wiredValue.adapter) {
                wireConfig.push(
                    t.objectProperty(t.identifier('adapter'), t.identifier(wiredValue.adapter.name))
                );
            }

            if (wiredValue.params) {
                wireConfig.push(
                    t.objectProperty(t.identifier('params'), t.objectExpression(wiredValue.params))
                );
            }

            if (wiredValue.static) {
                wireConfig.push(
                    t.objectProperty(t.identifier('static'), t.objectExpression(wiredValue.static))
                );
            }

            if (wiredValue.isClassMethod) {
                wireConfig.push(t.objectProperty(t.identifier('method'), t.numericLiteral(1)));
            }

            return t.objectProperty(
                t.identifier(wiredValue.propertyName),
                t.objectExpression(wireConfig)
            );
        })
    );
}

const SUPPORTED_VALUE_TO_TYPE_MAP = {
    StringLiteral: 'string',
    NumericLiteral: 'number',
    BooleanLiteral: 'boolean',
};

const scopedReferenceLookup = scope => name => {
    const binding = scope.getBinding(name);

    let type;
    let value;

    if (binding) {
        if (binding.kind === 'module') {
            // Resolves module import to the name of the module imported
            // e.g. import { foo } from 'bar' gives value 'bar' for `name == 'foo'
            const parentPathNode = binding.path.parentPath.node;
            if (parentPathNode && parentPathNode.source) {
                type = 'module';
                value = parentPathNode.source.value;
            }
        } else if (binding.kind === 'const') {
            // Resolves `const foo = 'text';` references to value 'text', where `name == 'foo'`
            const init = binding.path.node.init;
            if (init && SUPPORTED_VALUE_TO_TYPE_MAP[init.type]) {
                type = SUPPORTED_VALUE_TO_TYPE_MAP[init.type];
                value = init.value;
            }
        }
    }
    return {
        type,
        value,
    };
};

module.exports = function transform(t, klass, decorators) {
    const wiredValues = decorators.filter(isWireDecorator).map(({ path }) => {
        const [id, config] = path.get('expression.arguments');

        const propertyName = path.parentPath.get('key.name').node;
        const isClassMethod = path.parentPath.isClassMethod({
            kind: 'method',
        });

        const wiredValue = {
            propertyName,
            isClassMethod,
        };

        if (config) {
            wiredValue.static = getWiredStatic(config);
            wiredValue.params = getWiredParams(t, config);
        }

        const referenceLookup = scopedReferenceLookup(path.scope);

        if (id.isIdentifier()) {
            const adapterName = id.node.name;
            const reference = referenceLookup(adapterName);
            wiredValue.adapter = {
                name: adapterName,
                reference: reference.type === 'module' ? reference.value : undefined,
            };
        }

        return wiredValue;
    });

    if (wiredValues.length) {
        const staticProp = staticClassProperty(
            t,
            LWC_COMPONENT_PROPERTIES.WIRE,
            buildWireConfigValue(t, wiredValues)
        );

        markAsLWCNode(staticProp);

        klass.get('body').pushContainer('body', staticProp);
    }
};
