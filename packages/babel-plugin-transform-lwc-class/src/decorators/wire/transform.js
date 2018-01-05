const { isWireDecorator } = require('./shared');
const { staticClassProperty } = require('../../utils');

const WIRE_CLASS_PROPERTY = 'wire';
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
        const wireConfig = [
            t.objectProperty(
                t.identifier('type'),
                t.stringLiteral(wiredValue.type)
            ),
            t.objectProperty(
                t.identifier('params'),
                t.objectExpression(wiredValue.params)
            ),
            t.objectProperty(
                t.identifier('static'),
                t.objectExpression(wiredValue.static)
            )
        ];

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

module.exports = function transform(t, klass, decorators) {
    const wiredValues = decorators.filter(isWireDecorator).map(({ path }) => {
        const [id, config] = path.get('expression.arguments');

        const propertyName = path.parentPath.get('key.name').node;
        const isClassMethod = path.parentPath.isClassMethod({
            kind: 'method'
        });

        return {
            propertyName,
            isClassMethod,
            type: id.node.value,
            static: getWiredStatic(config),
            params: getWiredParams(t, config),
        };
    });

    if (wiredValues.length) {
        klass.get('body').pushContainer(
            'body',
            staticClassProperty(
                t,
                WIRE_CLASS_PROPERTY,
                buildWireConfigValue(t, wiredValues)
            )
        );
    }
}
