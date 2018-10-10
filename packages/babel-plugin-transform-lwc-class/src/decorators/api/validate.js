const { DecoratorErrors, generateCompilerError } = require('lwc-errors');
const { isApiDecorator } = require('./shared');
const {
    AMBIGUOUS_PROP_SET,
    DISALLOWED_PROP_SET,
    LWC_PACKAGE_EXPORTS: { TRACK_DECORATOR },
    DECORATOR_TYPES
} = require('../../constants');

function validateConflict(path, decorators) {
    const isPublicFieldTracked = decorators.some(decorator => (
        decorator.name === TRACK_DECORATOR
        && decorator.path.parentPath.node === path.parentPath.node
    ));

    if (isPublicFieldTracked) {
        throw generateCompilerError(
            DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT,
            [], {},
            path.buildCodeFrameError.bind(path)
        );
    }
}

function isBooleanPropDefaultTrue(property) {
    const propertyValue = property.node.value;
    return propertyValue && propertyValue.type === 'BooleanLiteral' && propertyValue.value;
}

function validatePropertyValue(property) {
    if (isBooleanPropDefaultTrue(property)) {
        throw generateCompilerError(
            DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY,
            [], {},
            property.buildCodeFrameError.bind(property)
        );
    }
}

function validatePropertyName(property) {
    if (property.node.computed) {
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED,
            [], {},
            property.buildCodeFrameError.bind(property)
        );
    }

    const propertyName = property.get('key.name').node;

    if (propertyName === 'part') {
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_NAME_PART_IS_RESERVED,
            [propertyName], {},
            property.buildCodeFrameError.bind(property)
        );
    } else if (propertyName.startsWith('on')) {
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_ON,
            [propertyName], {},
            property.buildCodeFrameError.bind(property)
        );
    } else if (propertyName.startsWith('data') && propertyName.length > 4) {
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_DATA,
            [propertyName], {},
            property.buildCodeFrameError.bind(property)
        );
    } else if (DISALLOWED_PROP_SET.has(propertyName)) {
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_NAME_IS_RESERVED,
            [propertyName], {},
            property.buildCodeFrameError.bind(property)
        );
    } else if (AMBIGUOUS_PROP_SET.has(propertyName)) {
        const camelCased = AMBIGUOUS_PROP_SET.get(propertyName);
        throw generateCompilerError(
            DecoratorErrors.PROPERTY_NAME_IS_AMBIGUOUS,
            [propertyName, camelCased], {},
            property.buildCodeFrameError.bind(property)
        );
    }
}

function validateSingleApiDecoratorOnSetterGetterPair(decorators) {
    decorators.filter(decorator => (isApiDecorator(decorator) && decorator.type === DECORATOR_TYPES.SETTER)).forEach(({ path }) => {
        const parentPath = path.parentPath;
        const name = parentPath.get('key.name').node;

        const associatedGetter = decorators.find(decorator => (
            isApiDecorator(decorator) &&
            decorator.type === DECORATOR_TYPES.GETTER &&
            parentPath.get('key.name').node === name
        ));

        if (associatedGetter) {
            throw generateCompilerError(
                DecoratorErrors.SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR,
                [name], {},
                parentPath.buildCodeFrameError.bind(parentPath)
            );
        }
    });
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
                throw generateCompilerError(
                    DecoratorErrors.DUPLICATE_API_PROPERTY,
                    [currentPropertyName], {},
                    comparePath.buildCodeFrameError.bind(comparePath)
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

    validateSingleApiDecoratorOnSetterGetterPair(decorators);
    validateUniqueness(decorators);
};
