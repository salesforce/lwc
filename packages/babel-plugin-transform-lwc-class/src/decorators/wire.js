const { isWireDecorator, staticClassProperty } = require('../utils');

const WIRE_CLASS_PROPERTY = 'wire';
const WIRE_PARAM_PREFIX = '$';

module.exports = function wireVisitor ({ types: t }) {
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

    function getWiredParams(wireConfig) {
        return wireConfig.get('properties')
            .filter(property => isObservedProperty(property))
            .map(path => {
                // Need to clone deep the observed property to remove the param prefix
                const clonedProperty = t.cloneDeep(path.node);
                clonedProperty.value.value = clonedProperty.value.value.slice(1);

                return clonedProperty;
            });
    }

    function buildWireConfigValue(wiredValues) {
        return t.objectExpression(wiredValues.map(wiredValue => {
            const wireConfig = [
                t.objectProperty(
                    t.identifier('params'),
                    t.objectExpression(wiredValue.params)
                ),
                t.objectProperty(
                    t.identifier('static'),
                    t.objectExpression(wiredValue.static)
                )
            ];

            // TODO: deprecate type (string as adapter id once consumer has migrated to use imported identifier)
            if (wiredValue.type) {
                wireConfig.push(
                    t.objectProperty(
                        t.identifier('type'),
                        t.stringLiteral(wiredValue.type)
                    )
                )
            }

            if (wiredValue.adapter) {
                wireConfig.push(
                    t.objectProperty(
                        t.identifier('adapter'),
                        t.identifier(wiredValue.adapter)
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

    const decoratorVisitor = {
        Decorator(path, { wiredValues }) {
            if (isWireDecorator(path)) {
                const [id, config] = path.get('expression.arguments');

                if (!id || !config) {
                    throw path.buildCodeFrameError(
                        `@wire(<adapterId>, <adapterConfig>) expects 2 parameters.`
                    );
                }

                // TODO: deprecate string as adapter id once consumer has migrated to use imported identifier
                if (!id.isStringLiteral() && !id.isIdentifier()) {
                    throw id.buildCodeFrameError(
                        `@wire expects a string or a function identifier as first parameter.`
                    );
                }

                if (id.isIdentifier() && !path.scope.getBinding(id.node.name).path.isImportSpecifier()) {
                    throw id.buildCodeFrameError(
                        `@wire expects a function identifier to be imported as first parameter.`
                    );
                }

                if (!config.isObjectExpression()) {
                    throw config.buildCodeFrameError(
                        `@wire expects a configuration object expression as second parameter.`
                    );
                }

                const propertyName = path.parentPath.get('key.name').node;
                const isClassMethod = path.parentPath.isClassMethod({
                    kind: 'method'
                });

                const wiredValue = {
                    propertyName,
                    isClassMethod,
                    static: getWiredStatic(config),
                    params: getWiredParams(config),
                }

                // TODO: deprecate type (string as adapter id once consumer has migrated to use imported identifier)
                if (id.isStringLiteral()) {
                    wiredValue.type = id.node.value;
                } else if (id.isIdentifier()) {
                    wiredValue.adapter = id.node.name;
                }

                wiredValues.push(wiredValue);

                path.remove();
            }
        },
        Class(path) {
            // Only treat the current class and not the nested one
            path.skip();
        }
    };

    return {
        Class(path) {
            const classBody = path.get('body');
            const wiredValues = [];

            path.traverse(decoratorVisitor, { wiredValues });

            if (wiredValues.length) {
                classBody.pushContainer('body', staticClassProperty(
                    t,
                    WIRE_CLASS_PROPERTY,
                    buildWireConfigValue(wiredValues)
                ));
            }
        },
    };
}
