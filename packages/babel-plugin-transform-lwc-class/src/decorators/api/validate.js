const { isApiDecorator } = require('./shared');
const {
    AMBIGUOUS_PROP_SET,
    DISALLOWED_PROP_SET,
    GLOBAL_ATTRIBUTE_MAP,
    LWC_PACKAGE_EXPORTS: { TRACK_DECORATOR },
    DECORATOR_TYPES
} = require('../../constants');

function validateConflict(path, decorators) {
    const isPublicFieldTracked = decorators.some(decorator => (
        decorator.name === TRACK_DECORATOR
        && decorator.path.parentPath.node === path.parentPath.node
    ));

    if (isPublicFieldTracked) {
        throw path.buildCodeFrameError('@api method or property cannot be used with @track');
    }
}

function isBooleanPropDefaultTrue(property) {
    const propertyValue = property.node.value;
    return propertyValue && propertyValue.type === 'BooleanLiteral' && propertyValue.value;
}

function validatePropertyValue(property) {
    if (isBooleanPropDefaultTrue(property)) {
        throw property.buildCodeFrameError('Boolean public property must default to false.');
    }
}

function validatePropertyName(property) {
    if (property.node.computed) {
        throw property.buildCodeFrameError('@api cannot be applied to a computed property, getter, setter or method.');
    }

    const propertyName = property.get('key.name').node;

    if (propertyName === 'part') {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. "part" is a future reserved attribute for web components.`
        );
    } else if (propertyName.startsWith('on')) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. Properties starting with "on" are reserved for event handlers.`
        );
    } else if (propertyName.startsWith('data') && propertyName.length > 4) {
        throw property.buildCodeFrameError(
            `Invalid property name ${propertyName}. Properties starting with "data" are reserved attributes.`
        );
    } else if (DISALLOWED_PROP_SET.has(propertyName)) {
        throw property.buildCodeFrameError(
            `Invalid property name "${propertyName}". "${propertyName}" is a reserved attribute.`
        );
    } else if (AMBIGUOUS_PROP_SET.has(propertyName)) {
        const camelCased = AMBIGUOUS_PROP_SET.get(propertyName);
        throw property.buildCodeFrameError(
            `Ambiguous attribute name ${propertyName}. ${propertyName} will never be called from template because its corresponding property is camel cased. Consider renaming to "${camelCased}".`
        );
    }
}

function validateUniqueness(decorators) {
    const apiDecorators = decorators.filter(isApiDecorator);

    for (let i = 0; i < apiDecorators.length; i++) {
        const { path: currentPath, type: currentType } = apiDecorators[i];
        const currentPropertyName = currentPath.parentPath.get('key.name').node;

        for (let j = 0; j < apiDecorators.length; j++) {
            const { path: comparePath, type: compareType } = apiDecorators[j];
            const comparePropertyName = comparePath.parentPath.get('key.name').node;

            // We will throw if the considered properties have the same name, and when their
            // are not part of a pair of getter/setter.
            const haveSameName = currentPropertyName === comparePropertyName;
            const isDifferentProperty = currentPath !== comparePath;
            const isGetterSetterPair = (
                (currentType === DECORATOR_TYPES.GETTER && compareType === DECORATOR_TYPES.SETTER) ||
                (currentType === DECORATOR_TYPES.SETTER && compareType === DECORATOR_TYPES.GETTER)
            );

            if (haveSameName && isDifferentProperty && !isGetterSetterPair) {
                throw comparePath.buildCodeFrameError(
                    `Duplicate @api property "${currentPropertyName}".`,
                );
            }
        }
    }
}

module.exports = function validate(klass, decorators) {
    decorators.filter(isApiDecorator).forEach(({ path, type }) => {
        validateConflict(path, decorators);

        if (type !== DECORATOR_TYPES.METHOD) {
            const property = path.parentPath;

            validatePropertyName(property);
            validatePropertyValue(property);
        }
    });

    validateUniqueness(decorators);
};
