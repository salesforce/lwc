/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_COMPONENT_PROPERTIES } from '../../constants';
import { isWireDecorator } from './shared';
import type { types, NodePath } from '@babel/core';
import type { DecoratorMeta } from '../index';
import type { BabelTypes } from '../../types';
import type { BindingOptions } from '../types';

const WIRE_PARAM_PREFIX = '$';
const WIRE_CONFIG_ARG_NAME = '$cmp';
const WIRE_CONFIG_COMPUTED_ARG = '$computed';

function isObservedProperty(configProperty: NodePath<types.ObjectProperty>) {
    const propertyValue = configProperty.get('value');
    return (
        propertyValue.isStringLiteral() && propertyValue.node.value.startsWith(WIRE_PARAM_PREFIX)
    );
}

function getWiredStatic(wireConfig: NodePath<types.ObjectExpression>): types.ObjectProperty[] {
    return wireConfig
        .get('properties')
        .filter((property) => !isObservedProperty(property as NodePath<types.ObjectProperty>))
        .map((path) => path.node) as types.ObjectProperty[];
}

function getWiredParams(
    t: BabelTypes,
    wireConfig: NodePath<types.ObjectExpression>
): types.ObjectProperty[] {
    return wireConfig
        .get('properties')
        .filter((property) => isObservedProperty(property as NodePath<types.ObjectProperty>))
        .map((path) => {
            // Need to clone deep the observed property to remove the param prefix
            const clonedProperty = t.cloneNode(path.node) as types.ObjectProperty;
            (clonedProperty.value as types.StringLiteral).value = (
                clonedProperty.value as types.StringLiteral
            ).value.slice(1);

            return clonedProperty;
        });
}

function getGeneratedConfig(
    t: BabelTypes,
    wiredValue: WiredValue,
    normalizedParamKeys: types.Expression[]
) {
    let counter = 0;
    const configBlockBody = [];
    const configProps: (types.ObjectMethod | types.ObjectProperty | types.SpreadElement)[] = [];
    const generateParameterConfigValue = (memberExprPaths: string[]) => {
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
        const memberExprPropertyGen = !isInvalidMemberExpr
            ? t.identifier
            : (t as any).StringLiteral;

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
        let conditionTest: types.Expression = t.binaryExpression(
            '!=',
            t.identifier(varName),
            t.nullLiteral()
        );

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
        wiredValue.params.forEach((param, index) => {
            const memberExprPaths = (param.value as types.StringLiteral).value.split('.');
            const paramConfigValue = generateParameterConfigValue(memberExprPaths);

            configProps.push(
                t.objectProperty(
                    // `normalizedParams` is the keys of `wiredValue.params`, but with
                    // dynamic expression replaced with references to the `$computed` array.
                    normalizedParamKeys[index],
                    paramConfigValue.configValueExpression,
                    param.computed
                )
            );

            if (paramConfigValue.varDeclaration) {
                configBlockBody.push(paramConfigValue.varDeclaration);
            }
        });
    }

    configBlockBody.push(t.returnStatement(t.objectExpression(configProps)));

    const fnExpression = t.functionExpression(
        null,
        [t.identifier(WIRE_CONFIG_ARG_NAME), t.identifier(WIRE_CONFIG_COMPUTED_ARG)],
        t.blockStatement(configBlockBody)
    );

    return t.objectProperty(t.identifier('config'), fnExpression);
}

function buildWireConfigValue(t: BabelTypes, wiredValues: WiredValue[]) {
    return t.objectExpression(
        wiredValues.map((wiredValue) => {
            const wireConfig = [];
            if (wiredValue.adapter) {
                wireConfig.push(
                    t.objectProperty(t.identifier('adapter'), wiredValue.adapter.expression)
                );
            }

            /** Array of computed params that need to be snapshotted. */
            const computedParams: types.Expression[] = [];
            /** Array of literals (`"key"`) or computed snapshots (`$computed[0]`). */
            const normalizedParams: Array<
                types.Identifier | types.Literal | types.MemberExpression
            > = [];
            if (wiredValue.params) {
                for (const p of wiredValue.params) {
                    const { key } = p;
                    if (
                        // Not using `t.isLiteral` to avoid regex and template literals
                        t.isStringLiteral(key) ||
                        t.isBooleanLiteral(key) ||
                        t.isBigIntLiteral(key) ||
                        t.isNumericLiteral(key) ||
                        t.isDecimalLiteral(key) ||
                        t.isNullLiteral(key)
                    ) {
                        // Simple literals always stringify to the same thing, so we don't need to
                        // snapshot them, even if technically they're computed
                        normalizedParams.push(key);
                    } else if (t.isIdentifier(key)) {
                        if (p.computed) {
                            normalizedParams.push(
                                t.memberExpression(
                                    t.identifier(WIRE_CONFIG_COMPUTED_ARG),
                                    t.numericLiteral(computedParams.length),
                                    true
                                )
                            );
                            computedParams.push(key);
                        } else {
                            normalizedParams.push(key);
                        }
                    } else if (!t.isPrivateName(key)) {
                        // Not a simple literal, identifier, or private name, so it must be
                        // a computed expression (e.g. `Math.random()`)
                        normalizedParams.push(
                            t.memberExpression(
                                t.identifier(WIRE_CONFIG_COMPUTED_ARG),
                                t.numericLiteral(computedParams.length),
                                true
                            )
                        );
                        computedParams.push(key);
                    } else {
                        // `key` could be a PrivateName or a new type introduced in the future
                        /* istanbul ignore next */
                        throw new Error(`Unexpected ${key.type} node used as property key.`);
                    }
                }
            }

            if (computedParams.length > 0) {
                // If we have computed params, add a .map to convert them all to strings/symbols
                // Result: `[Math.random()].map(key => typeof key === 'symbol' ? key : String(key))`
                const arr = t.arrayExpression(computedParams);
                const map = t.memberExpression(arr, t.identifier('map'));
                const mapVar = t.identifier('key');
                const func = t.arrowFunctionExpression(
                    [mapVar],
                    t.conditionalExpression(
                        t.binaryExpression(
                            '===',
                            t.unaryExpression('typeof', mapVar),
                            t.stringLiteral('symbol')
                        ),
                        mapVar,
                        t.callExpression(t.identifier('String'), [mapVar])
                    )
                );
                const normalizedDynamicParams = t.callExpression(map, [func]);
                wireConfig.push(
                    t.objectProperty(t.identifier('computed'), normalizedDynamicParams)
                );
            }

            if (wiredValue.isClassMethod) {
                wireConfig.push(t.objectProperty(t.identifier('method'), t.numericLiteral(1)));
            }

            wireConfig.push(getGeneratedConfig(t, wiredValue, normalizedParams));

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

const scopedReferenceLookup = (scope: NodePath['scope']) => (name: string) => {
    const binding = scope.getBinding(name);

    let type;
    let value;

    if (binding) {
        if (binding.kind === 'module') {
            // Resolves module import to the name of the module imported
            // e.g. import { foo } from 'bar' gives value 'bar' for `name == 'foo'
            const parentPathNode = binding.path.parentPath!.node as types.ImportDeclaration;
            if (parentPathNode && parentPathNode.source) {
                type = 'module';
                value = parentPathNode.source.value;
            }
        } else if (binding.kind === 'const') {
            // Resolves `const foo = 'text';` references to value 'text', where `name == 'foo'`
            const init = (binding.path.node as BindingOptions).init;
            if (
                init &&
                SUPPORTED_VALUE_TO_TYPE_MAP[init.type as keyof typeof SUPPORTED_VALUE_TO_TYPE_MAP]
            ) {
                type =
                    SUPPORTED_VALUE_TO_TYPE_MAP[
                        init.type as keyof typeof SUPPORTED_VALUE_TO_TYPE_MAP
                    ];
                value = (init as types.StringLiteral | types.NumericLiteral | types.BooleanLiteral)
                    .value;
            }
        }
    }
    return {
        type,
        value,
    };
};

type WiredValue = {
    propertyName: string;
    isClassMethod: boolean;
    static?: types.ObjectProperty[];
    params?: types.ObjectProperty[];
    adapter?: {
        name: string;
        expression: types.Expression;
        reference: any;
    };
};

export default function transform(t: BabelTypes, decoratorMetas: DecoratorMeta[]) {
    const objectProperties = [];
    const wiredValues = decoratorMetas.filter(isWireDecorator).map(({ path }) => {
        const [id, config] = path.get('expression.arguments') as [
            NodePath,
            NodePath<types.ObjectExpression> | undefined,
        ];

        const propertyName = (path.parentPath.get('key.name') as any).node as string;
        const isClassMethod = path.parentPath.isClassMethod({
            kind: 'method',
        });

        const wiredValue: WiredValue = {
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
            const referenceName = isMemberExpression ? (id.node.object as any).name : id.node.name;
            const reference = referenceLookup(referenceName);
            wiredValue.adapter = {
                name: referenceName,
                expression: t.cloneNode(id.node),
                reference: reference.type === 'module' ? reference.value : undefined,
            };
        }

        return wiredValue;
    });

    if (wiredValues.length) {
        objectProperties.push(
            t.objectProperty(
                t.identifier(LWC_COMPONENT_PROPERTIES.WIRE),
                buildWireConfigValue(t, wiredValues)
            )
        );
    }

    return objectProperties;
}
