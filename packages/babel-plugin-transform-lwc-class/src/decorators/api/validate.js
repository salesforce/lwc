const { GLOBAL_ATTRIBUTE_SET } = require('../../constants');

function isBooleanPropDefaultTrue(property) {
    const propertyValue = property.node.value;
    return propertyValue && propertyValue.type === "BooleanLiteral" && propertyValue.value;
}

function validatePropertyName(property) {
    const propertyName = property.get('key.name').node;

    if (propertyName === 'is') {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. "is" is a reserved attribute.`
        );
    } else if (propertyName === 'part') {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. "part" is a future reserved attribute for web components.`
        );
    } else if (propertyName.startsWith('on')) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. Properties starting with "on" are reserved for event handlers.`
        );
    } else if (propertyName.startsWith('data')) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. Properties starting with "data" are reserved attributes.`
        );
    } else if (propertyName.startsWith('aria')) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. Properties starting with "aria" are reserved attributes.`
        );
    } else if (GLOBAL_ATTRIBUTE_SET.has(propertyName)) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. ${propertyName} is a global HTML attribute, use attributeChangedCallback to observe this attribute.`
        );
    }
}

module.exports = function validate(identifier) {
    const decorator = identifier.parentPath;
    if (!decorator.isDecorator()) {
        throw decorator.buildCodeFrameError('"api" can only be used as a decorator');
    }

    const propertyOrMethod = decorator.parentPath;
    if (!propertyOrMethod.isClassProperty() && !propertyOrMethod.isClassMethod()) {
        throw propertyOrMethod.buildCodeFrameError('"@api" can only be applied on class properties');
    }

    if (propertyOrMethod.isClassProperty()) {
        const property = propertyOrMethod;
        validatePropertyName(property);

        if (isBooleanPropDefaultTrue(property)) {
            throw property.buildCodeFrameError('Boolean public property must default to false.');
        }

        if (property.node.computed) {
            throw property.buildCodeFrameError('"@api" cannot be applied to a computed property, getter, setter or method.');
        }
    }
}
