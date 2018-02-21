const { isApiDecorator } = require('./shared');
const {
    AMBIGIOUS_PROP_SET,
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
    } else if (AMBIGIOUS_PROP_SET.has(propertyName)) {
        const { propName = propertyName } = GLOBAL_ATTRIBUTE_MAP.get(propertyName) || {};
        throw property.buildCodeFrameError(
            `Ambigious attribute name ${propertyName}. ${propertyName} will never be called from template because its corresponding property is camel cased. Consider renaming to "${propName}".`
        );
    }
}

function validatePairSetterGetter(decorators) {
    decorators.filter(decorator => (
        isApiDecorator(decorator) &&
        decorator.type === DECORATOR_TYPES.SETTER
    )).forEach(({ path }) => {
        const name = path.parentPath.get('key.name').node;

        const associatedGetter = decorators.find(decorator => (
            isApiDecorator(decorator) &&
            decorator.type === DECORATOR_TYPES.GETTER &&
            path.parentPath.get('key.name').node === name
        ))

        if (!associatedGetter) {
            throw path.buildCodeFrameError(`@api set ${name} setter does not have associated getter.`);
        }
    });
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

    validatePairSetterGetter(decorators);
}
