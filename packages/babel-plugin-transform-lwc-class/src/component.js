const { basename } = require('path');
const moduleImports = require("@babel/helper-module-imports");
const { findClassMethod, getEngineImportSpecifiers, isComponentClass, isDefaultExport } = require('./utils');
const { GLOBAL_ATTRIBUTE_MAP, LWC_PACKAGE_EXPORTS, LWC_COMPONENT_PROPERTIES } = require('./constants');
const CLASS_PROPERTY_OBSERVED_ATTRIBUTES = 'observedAttributes';

module.exports = function ({ types: t }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers.filter(({ name }) => (
                name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT || name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT_LEGACY
            )).map(({ path }) => (
                path.get('local')
            ));
        },
        ClassProperty(path, state) {
            if (isObservedAttributesStaticProperty(path)) {
                const observedAttributeNames = path.node.value.elements.map((elem) => {
                    const { value } = elem;
                    const { propName = value } = (GLOBAL_ATTRIBUTE_MAP.get(value) || {});
                    return `"${propName}"`;
                });
                throw path.buildCodeFrameError(
                    `Invalid static property "observedAttributes". "observedAttributes" cannot be used to track attribute changes. Define setters for ${observedAttributeNames.join(', ')} instead.`
                );
            }
        },
        Class(path, state) {
            const isComponent = isComponentClass(path, state.componentBaseClassImports);

            if (isComponent) {
                const classRef = path.node.id;
                if (!classRef) {
                    throw path.buildCodeFrameError(
                        `LWC component class can't be an anonymous.`
                    );
                }

                if (isDefaultExport(path)) {
                    // Import and wire template to the component if the class has no render method
                    const classBody = path.get('body');
                    if (!findClassMethod(classBody, LWC_COMPONENT_PROPERTIES.RENDER)) {
                        wireTemplateToClass(path, state, classBody);
                    }
                }
            }
        }
    };

    function isObservedAttributesStaticProperty(classPropertyPath) {
        const { static: isStaticProperty, key: { name: propertyName } } = classPropertyPath.node;
        return (isStaticProperty && propertyName === CLASS_PROPERTY_OBSERVED_ATTRIBUTES);
    }

    function getBaseName({ file }) {
        const classPath = file.opts.filename;
        return basename(classPath, '.js');
    }

    function importDefaultTemplate(path, state) {
        const componentName = getBaseName(state);
        return moduleImports.addDefault(path, `./${componentName}.html`, { nameHint: 'tmpl' });
    }

    function wireTemplateToClass(path, state, classBody) {
        const templateIdentifier = importDefaultTemplate(path, state);

        const renderMethod = t.classMethod(
            'method',
            t.identifier(LWC_COMPONENT_PROPERTIES.RENDER),
            [],
            t.blockStatement([
                t.returnStatement(templateIdentifier),
            ]),
        );

        classBody.pushContainer('body', [
            renderMethod,
        ]);
    }
};
