const {
    isAPIDecorator,
    isClassMethod,
    isGetterClassMethod,
    isSetterClassMethod,
    staticClassProperty
} = require('../utils');

const PUBLIC_PROPS_CLASS_PROPERTY = 'publicProps';
const PUBLIC_METHODS_CLASS_PROPERTY = 'publicMethods';

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2
}

const { GLOBAL_ATTRIBUTE_SET } = require('../constants');

function getPropertyBitmask(classProperty) {
    const isGetter = isGetterClassMethod(classProperty);
    const isSetter = isSetterClassMethod(classProperty);

    let bitMask;
    if (isGetter) {
        bitMask = PUBLIC_PROP_BIT_MASK.GETTER;
    } else if (isSetter) {
        bitMask = PUBLIC_PROP_BIT_MASK.SETTER;
    } else {
        bitMask = PUBLIC_PROP_BIT_MASK.PROPERTY;
    }

    return bitMask;
}

function computePublicPropsConfig(publicProps) {
    const decorateProperties = publicProps.map(
        decorator => decorator.parentPath
    );

    return decorateProperties.reduce((config, property) => {
        validatePropertyName(property);

        const propertyName = property.get('key.name').node;

        if (isBooleanPropDefaultTrue(property)) {
            throw property.buildCodeFrameError(
                `Boolean public property ${propertyName} must default to false.`
            );
        }

        // Ensure all public setters are associated with a getter
        if (isSetterClassMethod(property)) {
            const associatedGetter = decorateProperties.find(property => (
                isGetterClassMethod(property) &&
                property.get('key.name').node === propertyName
            ));

            if (!associatedGetter) {
                throw property.buildCodeFrameError(
                    `@api set ${propertyName} setter does not have associated getter.`
                )
            }
        }

        if (!(propertyName in config)) {
            config[propertyName] = {};
        }

        config[propertyName].config |= getPropertyBitmask(property);
        return config;
    }, {});
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
    } else if (propertyName.startsWith('data') && propertyName !== 'data') {
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

function isBooleanPropDefaultTrue(property) {
    const propertyValue = property.node.value;
    return propertyValue && propertyValue.type === "BooleanLiteral" && propertyValue.value;
}

function computePublicMethodsConfig(publicMethods) {
    return publicMethods.map(decorator => (
        decorator.parentPath.get('key.name').node
    ));
}

module.exports = function apiVisitor ({ types: t }) {
    const decoratorVisitor = {
        Decorator(path, { publicMethods, publicProps }) {
            if (isAPIDecorator(path)) {
                path.remove();
                const { parentPath } = path;
                if (parentPath.node.computed) {
                    const { node: name } = parentPath.get('key.name');
                    throw parentPath.buildCodeFrameError('@api cannot be applied to a computed property, getter, setter or method.')
                }

                if (isClassMethod(path.parentPath)) {
                    publicMethods.push(path);
                } else {
                    publicProps.push(path);
                }
            }
        },
        Class(path) {
            // Only treat the current class and not the nested one
            path.skip();
        }
    };

    return {
        Class(path, state) {
            const classBody = path.get('body');
            const publicMethods = []; // paths to @api Decorator nodes for class methods
            const publicProps = []; // paths to @api Decorator nodes for class properties

            path.traverse(decoratorVisitor, {
                publicMethods,
                publicProps,
            });

            publicProps.forEach((decoratorPath) => {
                const property = decoratorPath.parent;
                if (property.kind !== 'get') {
                    const id = property.key;
                    state.file.metadata.apiProperties.push({
                        name: id.name
                    });
                }
            });

            if (publicProps.length) {
                const publicPropsConfig = computePublicPropsConfig(publicProps);
                classBody.pushContainer('body', staticClassProperty(
                    t,
                    PUBLIC_PROPS_CLASS_PROPERTY,
                    t.valueToNode(publicPropsConfig)
                ));
            }

            if (publicMethods.length) {
                const publicMethodsConfig = computePublicMethodsConfig(publicMethods);
                classBody.pushContainer('body', staticClassProperty(
                    t,
                    PUBLIC_METHODS_CLASS_PROPERTY,
                    t.valueToNode(publicMethodsConfig)
                ));
            }
        },
    };
}
