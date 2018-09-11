const { isWireDecorator } = require('./shared');
const { staticClassProperty } = require('../../utils');
const { LWC_COMPONENT_PROPERTIES } = require('../../constants');

const WIRE_PARAM_PREFIX = '$';

function isObservedProperty(configProperty) {
    const propertyValue = configProperty.get('value');
    return propertyValue.isStringLiteral() &&
        propertyValue.node.value.startsWith(WIRE_PARAM_PREFIX);
}

function getWiredStatic(wireConfig) {
    return wireConfig.get('properties')
        .filter(property => !isObservedProperty(property))
        .map(path => path.node);
}

function getWiredParams(t, wireConfig) {
    return wireConfig.get('properties')
        .filter(property => isObservedProperty(property))
        .map(path => {
            // Need to clone deep the observed property to remove the param prefix
            const clonedProperty = t.cloneDeep(path.node);
            clonedProperty.value.value = clonedProperty.value.value.slice(1);

            return clonedProperty;
        });
}

function buildWireConfigValue(t, wiredValues) {
    return t.objectExpression(wiredValues.map(wiredValue => {
        const wireConfig = [];
        if (wiredValue.adapter) {
            wireConfig.push(
                t.objectProperty(
                    t.identifier('adapter'),
                    t.identifier(wiredValue.adapter.name)
                )
            )
        }

        if (wiredValue.params) {
            wireConfig.push(
                t.objectProperty(
                    t.identifier('params'),
                    t.objectExpression(wiredValue.params)
                )
            );
        }

        if (wiredValue.static) {
            wireConfig.push(
                t.objectProperty(
                    t.identifier('static'),
                    t.objectExpression(wiredValue.static)
                )
            )
        }

        if (wiredValue.isClassMethod) {
            wireConfig.push(
                t.objectProperty(
                    t.identifier('method'),
                    t.numericLiteral(1)
                )
            );
        }

        return t.objectProperty(
            t.identifier(wiredValue.propertyName),
            t.objectExpression(wireConfig)
        );
    }));
}

function getWiredStaticMetadata(properties, identifierValueResolver) {
    const ret = {};
    properties.forEach(s => {
        if (s.key.type === 'Identifier' && s.value.type === 'ArrayExpression') {
            ret[s.key.name] = s.value.elements.map(e => e.value);
        } else if (s.key.type === 'Identifier' && s.value.type === 'Identifier') {
            ret[s.key.name] = {reference: identifierValueResolver(s.value.name)};
        }
    });
    return ret;
}

function getWiredParamMetadata(properties) {
    const ret = {};
    properties.forEach(p => {
        if (p.key.type === 'Identifier' && p.value.type === 'StringLiteral') {
            ret[p.key.name] = p.value.value;
        }
    });
    return ret;
}

module.exports = function transform(t, klass, decorators) {
    const metadata = [];
    const wiredValues = decorators.filter(isWireDecorator).map(({ path }) => {
        const [id, config] = path.get('arguments');

        const propertyName = path.parentPath.get('key.name').node;
        const isClassMethod = path.parentPath.isClassMethod({
            kind: 'method'
        });

        const wiredValue = {
            propertyName,
            isClassMethod
        };

        if (config) {
            wiredValue.static = getWiredStatic(config);
            wiredValue.params = getWiredParams(t, config);
        }

        const identifierValueResolver = name => path.scope.getBinding(name).path.parentPath.node.source.value;

        if (id.isIdentifier()) {
            wiredValue.adapter = {
                name: id.node.name,
                reference: identifierValueResolver(id.node.name)
            }
        }

        const wireMetadata = {
            name: wiredValue.propertyName,
            adapter: wiredValue.adapter,
            type: isClassMethod ? 'method' : 'property'
        };

        if (config) {
            wireMetadata.static = getWiredStaticMetadata(wiredValue.static, identifierValueResolver);
            wireMetadata.params = getWiredParamMetadata(wiredValue.params);
        }

        metadata.push(wireMetadata);

        return wiredValue;
    });

    if (wiredValues.length) {
        klass.get('body').pushContainer(
            'body',
            staticClassProperty(
                t,
                LWC_COMPONENT_PROPERTIES.WIRE,
                buildWireConfigValue(t, wiredValues)
            )
        );
    }

    if (metadata.length > 0) {
        return {
            type: 'wire',
            targets: metadata
        };
    }
};
