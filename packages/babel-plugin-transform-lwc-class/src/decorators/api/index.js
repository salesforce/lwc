const validate = require('./validate');
const { RAPTOR_PACKAGE_ALIAS, RAPTOR_PACKAGE_EXPORTS, RAPTOR_COMPONENT_PROPERTIES } = require('../../constants');
const { isClassMethod, isGetterClassMethod, isSetterClassMethod, staticClassProperty, getLocalImportLocals } = require('../../utils');

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2
};

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

/**
 * Returns the public props configuration of a class based on a list decorators.
 */
function computePublicPropsConfig(decorators) {
    return decorators.reduce((config, decorator) => {
        const property = decorator.parentPath;
        const propertyName = property.get('key.name').node;

        // Ensure all public setters are associated with a getter
        if (isSetterClassMethod(property)) {
            const associatedGetter = decorators.find(property => (
                isGetterClassMethod(property.parentPath) &&
                property.parentPath.get('key.name').node === propertyName
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

/**
 * Returns the public methods configuration of class based on a list of decorators.
 */
function computePublicMethodsConfig(decorators) {
    return decorators.map(decorator => (
        decorator.parentPath.get('key.name').node
    ));
}

/**
 * Returns all the references to "api" grouped by class.
 */
function getApiReferences(apiIdentifiers) {
    const klassApiMapping = new Map();

    for (let apiIdentifier of apiIdentifiers) {
        const { referencePaths } = apiIdentifier.scope.getBinding(apiIdentifier.node.name);

        for (let reference of referencePaths) {
            validate(reference);

            const klass = reference.findParent(node => node.isClass());
            const decorator = reference.parentPath;

            if (klassApiMapping.has(klass)) {
                klassApiMapping.set(klass, [...klassApiMapping.get(klass), decorator]);
            } else {
                klassApiMapping.set(klass, [decorator]);
            }
        }
    }

    return klassApiMapping;
}

/**
 * Remove specifier from an import statement.
 * It will also remove the import statement it self if the list of specifiers is empty.
 */
function removeImportSpecifier(specifier) {
    specifier.remove();

    const importStatement = specifier.parentPath;
    if (importStatement.node.specifiers.length === 0) {
        importStatement.remove();
    }
}

module.exports = function apiVisitor({ types: t }) {
    return {
        Program(path, state) {
            const apiImports = getLocalImportLocals(path, RAPTOR_PACKAGE_ALIAS, RAPTOR_PACKAGE_EXPORTS.API_DECORATOR);
            const apiReferences = getApiReferences(apiImports);

            for (let [klass, apis] of apiReferences) {
                const classBody = klass.get('body');
                const publicMethods = []; // paths to @api Decorator nodes for class methods
                const publicProps = []; // paths to @api Decorator nodes for class properties

                for (let decorator of apis) {
                    if (isClassMethod(decorator.parentPath)) {
                        publicMethods.push(decorator);
                    } else {
                        publicProps.push(decorator);
                    }
                }

                if (publicProps.length) {
                    for (let decorator of publicProps) {
                        const property = decorator.parentPath.node;
                        if (property.kind !== 'get') {
                            const id = property.key;
                            state.file.metadata.apiProperties.push({
                                name: id.name
                            });
                        }
                    }

                    const publicPropsConfig = computePublicPropsConfig(publicProps);
                    classBody.pushContainer('body', staticClassProperty(
                        t,
                        RAPTOR_COMPONENT_PROPERTIES.PUBLIC_PROPS,
                        t.valueToNode(publicPropsConfig)
                    ));
                }

                if (publicMethods.length) {
                    const publicMethodsConfig = computePublicMethodsConfig(publicMethods);
                    classBody.pushContainer('body', staticClassProperty(
                        t,
                        RAPTOR_COMPONENT_PROPERTIES.PUBLIC_METHODS,
                        t.valueToNode(publicMethodsConfig)
                    ));
                }

                // Finally remove all the api decorators
                for (let api of apis) {
                    api.remove();
                }
            }

            for (let apiImport of apiImports) {
                removeImportSpecifier(apiImport.parentPath);
            }
        },
    };
}
