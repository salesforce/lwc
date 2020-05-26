/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isWireDecorator } = require('./shared');
const { staticClassProperty, markAsLWCNode } = require('../../utils');
const { LWC_COMPONENT_PROPERTIES } = require('../../constants');

const WIRE_PARAM_PREFIX = '$';
const WIRE_CONFIG_ARG_NAME = '$cmp';

function isObservedProperty(configProperty) {
    const propertyValue = configProperty.get('value');
    return (
        propertyValue.isStringLiteral() && propertyValue.node.value.startsWith(WIRE_PARAM_PREFIX)
    );
}

function getWiredStatic(wireConfig) {
    return wireConfig
        .get('properties')
        .filter((property) => !isObservedProperty(property))
        .map((path) => path.node);
}

function getWiredParams(t, wireConfig) {
    return wireConfig
        .get('properties')
        .filter((property) => isObservedProperty(property))
        .map((path) => {
            // Need to clone deep the observed property to remove the param prefix
            const clonedProperty = t.cloneDeep(path.node);
            clonedProperty.value.value = clonedProperty.value.value.slice(1);

            return clonedProperty;
        });
}

function getGeneratedConfig(t, wiredValue) {
    let counter = 0;
    const configBlockBody = [];
    const configProps = [];
    const generateParameterConfigValue = (memberExprPaths) => {
        // Note: When memberExprPaths ($foo.bar) has an invalid identifier (eg: foo..bar, foo.bar[3])
        //       it should (ideally) resolve in a compilation error during validation phase.
        //       This is not possible due that platform components may have a param definition which is invalid
        //       but passes compilation, and throwing at compile time would break such components.
        //       In such cases where the param does not have proper notation, the config generated will use the bracket
        //       notation to match the current behavior (that most likely end up resolving that param as undefined).
        const isInvalidMemberExpr = memberExprPaths.some(
            (maybeIdentifier) =>
                !(t.isValidES3Identifier(maybeIdentifier) && maybeIdentifier.length > 0)
        );
        const memberExprPropertyGen = !isInvalidMemberExpr ? t.identifier : t.StringLiteral;

        if (memberExprPaths.length === 1) {
            return {
                configValueExpression: t.memberExpression(
                    t.identifier(WIRE_CONFIG_ARG_NAME),
                    memberExprPropertyGen(memberExprPaths[0])
                ),
            };
        }

        const varName = 'v' + ++counter;
        const varDeclaration = t.variableDeclaration('let', [
            t.variableDeclarator(
                t.identifier(varName),
                t.memberExpression(
                    t.identifier(WIRE_CONFIG_ARG_NAME),
                    memberExprPropertyGen(memberExprPaths[0]),
                    isInvalidMemberExpr
                )
            ),
        ]);

        // Results in: v != null && ... (v = v.i) != null && ... (v = v.(n-1)) != null
        let conditionTest = t.binaryExpression('!=', t.identifier(varName), t.nullLiteral());

        for (let i = 1, n = memberExprPaths.length; i < n - 1; i++) {
            const nextPropValue = t.assignmentExpression(
                '=',
                t.identifier(varName),
                t.memberExpression(
                    t.identifier(varName),
                    memberExprPropertyGen(memberExprPaths[i]),
                    isInvalidMemberExpr
                )
            );

            conditionTest = t.logicalExpression(
                '&&',
                conditionTest,
                t.binaryExpression('!=', nextPropValue, t.nullLiteral())
            );
        }

        // conditionTest ? v.n : undefined
        const configValueExpression = t.conditionalExpression(
            conditionTest,
            t.memberExpression(
                t.identifier(varName),
                memberExprPropertyGen(memberExprPaths[memberExprPaths.length - 1]),
                isInvalidMemberExpr
            ),
            t.identifier('undefined')
        );

        return {
            varDeclaration,
            configValueExpression,
        };
    };

    if (wiredValue.static) {
        Array.prototype.push.apply(configProps, wiredValue.static);
    }

    if (wiredValue.params) {
        wiredValue.params.forEach((param) => {
            const memberExprPaths = param.value.value.split('.');
            const paramConfigValue = generateParameterConfigValue(memberExprPaths);

            configProps.push(t.objectProperty(param.key, paramConfigValue.configValueExpression));

            if (paramConfigValue.varDeclaration) {
                configBlockBody.push(paramConfigValue.varDeclaration);
            }
        });
    }

    configBlockBody.push(t.returnStatement(t.objectExpression(configProps)));

    const fnExpression = t.functionExpression(
        null,
        [t.identifier(WIRE_CONFIG_ARG_NAME)],
        t.blockStatement(configBlockBody)
    );

    return t.objectProperty(t.identifier('config'), fnExpression);
}

function buildWireConfigValue(t, wiredValues) {
    return t.objectExpression(
        wiredValues.map((wiredValue) => {
            const wireConfig = [];
            if (wiredValue.adapter) {
                wireConfig.push(
                    t.objectProperty(t.identifier('adapter'), wiredValue.adapter.expression)
                );
            }

            if (wiredValue.params) {
                const dynamicParamNames = wiredValue.params.map((p) => {
                    return t.stringLiteral(t.isIdentifier(p.key) ? p.key.name : p.key.value);
                });
                wireConfig.push(
                    t.objectProperty(t.identifier('dynamic'), t.arrayExpression(dynamicParamNames))
                );
            }

            if (wiredValue.isClassMethod) {
                wireConfig.push(t.objectProperty(t.identifier('method'), t.numericLiteral(1)));
            }

            wireConfig.push(getGeneratedConfig(t, wiredValue));

            return t.objectProperty(
                t.identifier(wiredValue.propertyName),
                t.objectExpression(wireConfig)
            );
        })
    );
}

const SUPPORTED_VALUE_TO_TYPE_MAP = {
    StringLiteral: 'string',
    NumericLiteral: 'number',
    BooleanLiteral: 'boolean',
};

const scopedReferenceLookup = (scope) => (name) => {
    const binding = scope.getBinding(name);

    let type;
    let value;

    if (binding) {
        if (binding.kind === 'module') {
            // Resolves module import to the name of the module imported
            // e.g. import { foo } from 'bar' gives value 'bar' for `name == 'foo'
            const parentPathNode = binding.path.parentPath.node;
            if (parentPathNode && parentPathNode.source) {
                type = 'module';
                value = parentPathNode.source.value;
            }
        } else if (binding.kind === 'const') {
            // Resolves `const foo = 'text';` references to value 'text', where `name == 'foo'`
            const init = binding.path.node.init;
            if (init && SUPPORTED_VALUE_TO_TYPE_MAP[init.type]) {
                type = SUPPORTED_VALUE_TO_TYPE_MAP[init.type];
                value = init.value;
            }
        }
    }
    return {
        type,
        value,
    };
};

module.exports = function transform(t, klass, decorators) {
    const wiredValues = decorators.filter(isWireDecorator).map(({ path }) => {
        const [id, config] = path.get('expression.arguments');

        const propertyName = path.parentPath.get('key.name').node;
        const isClassMethod = path.parentPath.isClassMethod({
            kind: 'method',
        });

        const wiredValue = {
            propertyName,
            isClassMethod,
        };

        if (config) {
            wiredValue.static = getWiredStatic(config);
            wiredValue.params = getWiredParams(t, config);
        }

        const referenceLookup = scopedReferenceLookup(path.scope);
        const isMemberExpression = id.isMemberExpression();
        const isIdentifier = id.isIdentifier();

        if (isIdentifier || isMemberExpression) {
            const referenceName = isMemberExpression ? id.node.object.name : id.node.name;
            const reference = referenceLookup(referenceName);
            wiredValue.adapter = {
                name: referenceName,
                expression: t.cloneDeep(id.node),
                reference: reference.type === 'module' ? reference.value : undefined,
            };
        }

        return wiredValue;
    });

    if (wiredValues.length) {
        const staticProp = staticClassProperty(
            t,
            LWC_COMPONENT_PROPERTIES.WIRE,
            buildWireConfigValue(t, wiredValues)
        );

        markAsLWCNode(staticProp);

        klass.get('body').pushContainer('body', staticProp);
    }
};
