const { generateError, getEngineImportSpecifiers } = require('./utils');
const { GLOBAL_ATTRIBUTE_MAP, LWC_PACKAGE_EXPORTS, LWC_API_WHITELIST } = require('./constants');
const { LWCClassErrors } = require('lwc-errors');
const CLASS_PROPERTY_OBSERVED_ATTRIBUTES = 'observedAttributes';

module.exports = function ({ types: t }) {
    return {
        Program(path, state) {
            const engineImportSpecifiers = getEngineImportSpecifiers(path);

            // validate internal api imports
            engineImportSpecifiers.forEach(({name}) => {
                if (!LWC_API_WHITELIST.has(name)) {
                    throw generateError(path, {
                        errorInfo: LWCClassErrors.INVALID_IMPORT_PROHIBITED_API,
                        messageArgs: [name]
                    });
                }
            })

            // Store on state local identifiers referencing engine base component
            state.componentBaseClassImports = engineImportSpecifiers.filter(({ name }) => (
                name === LWC_PACKAGE_EXPORTS.BASE_COMPONENT
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
                throw generateError(path, {
                    errorInfo: LWCClassErrors.INVALID_STATIC_OBSERVEDATTRIBUTES,
                    messageArgs: [observedAttributeNames.join(', ')]
                });
            }
        }
    };

    function isObservedAttributesStaticProperty(classPropertyPath) {
        const { static: isStaticProperty, key: { name: propertyName } } = classPropertyPath.node;
        return (isStaticProperty && propertyName === CLASS_PROPERTY_OBSERVED_ATTRIBUTES);
    }
};
