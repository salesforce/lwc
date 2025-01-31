/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush } from '@lwc/shared';
import { LWC_COMPONENT_PROPERTIES } from '../../constants';
import { isWireDecorator } from './shared';
import type { types, NodePath } from '@babel/core';
import type { DecoratorMeta } from '../index';
import type { BabelTypes } from '../../types';
import type { BindingOptions } from '../types';

const WIRE_PARAM_PREFIX = '$';
const WIRE_CONFIG_ARG_NAME = '$cmp';
const WIRE_CONFIG_COMPUTED_KEYS_NAME = '$keys';

/** Determines whether the given property has a value starting with `$`. */
function isObservedProperty(
    t: BabelTypes,
    prop: types.ObjectProperty
): prop is types.ObjectProperty & { value: types.StringLiteral } {
    const { value } = prop;
    return t.isStringLiteral(value) && value.value.startsWith(WIRE_PARAM_PREFIX);
}

/**
 * Determines whether a node is a literal for a primitive value that can be converted to a string
 * at compile time. Excludes template literals.
 */
function isPrimitiveLiteral(
    t: BabelTypes,
    node: types.Expression | types.PrivateName
): node is
    | types.StringLiteral
    | types.NumericLiteral
    | types.BigIntLiteral
    | types.BooleanLiteral
    | types.NullLiteral {
    return (
        t.isStringLiteral(node) ||
        t.isNumericLiteral(node) ||
        t.isBigIntLiteral(node) ||
        t.isBooleanLiteral(node) ||
        t.isNullLiteral(node)
    );
}

function parseWiredParams(t: BabelTypes, wireConfig: NodePath<types.ObjectExpression>) {
    /** excludes literals like {[123]: 321} because those can be stringified at compile time */
    const computedKeys: types.Expression[] = [];
    /** { key: 'value' } props, ...spread and methods(){} */
    const staticProps: types.ObjectExpression['properties'] = [];
    /** { key: '$dynamic' } props */
    const dynamicProps: types.ObjectProperty[] = [];

    for (const prop of wireConfig.get('properties')) {
        if (prop.isObjectProperty()) {
            const node = t.cloneNode(prop.node);
            const { key } = node;

            if (node.computed) {
                if (isPrimitiveLiteral(t, key)) {
                    // {[123]: 'bar'} => can normalize to non-computed string, for simplicity
                    // null literals have no `value`, so get special handling
                    node.key = t.stringLiteral('value' in key ? String(key.value) : 'null');
                    node.computed = false;
                } else if (t.isExpression(key)) {
                    // {[Math.random()]: val}
                    // Add key to computed array, replace object key with array lookup
                    node.key = t.memberExpression(
                        t.identifier(WIRE_CONFIG_COMPUTED_KEYS_NAME),
                        t.numericLiteral(computedKeys.length),
                        true
                    );
                    computedKeys.push(key);
                }
            } else if (t.isNumericLiteral(key)) {
                // {123: val} => {"123": val} so that later code doesn't have to handle numbers
                node.key = t.stringLiteral(String(key.value));
            }

            if (isObservedProperty(t, node)) {
                // props with $reactive values = dynamic
                node.value.value = node.value.value.slice(1); // remove leading $
                dynamicProps.push(node);
            } else {
                // props without $reactive values = static
                staticProps.push(node);
            }
        } else {
            // method(){} or ...spread -- pass through as is
            staticProps.push(prop.node);
        }
    }
    return {
        computed: computedKeys,
        params: dynamicProps,
        static: staticProps,
    };
}

function getGeneratedConfig(t: BabelTypes, wiredValue: WiredValue) {
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

    if (wiredValue.static?.length) {
        ArrayPush.apply(configProps, wiredValue.static);
    }

    if (wiredValue.params?.length) {
        wiredValue.params.forEach((param) => {
            const memberExprPaths = ((param as any).value.value as string).split('.');
            const paramConfigValue = generateParameterConfigValue(memberExprPaths);

            configProps.push(
                t.objectProperty(param.key, paramConfigValue.configValueExpression, param.computed)
            );

            if (paramConfigValue.varDeclaration) {
                configBlockBody.push(paramConfigValue.varDeclaration);
            }
        });
    }

    configBlockBody.push(t.returnStatement(t.objectExpression(configProps)));

    const fnExpression = t.functionExpression(
        null,
        wiredValue.computed?.length
            ? [t.identifier(WIRE_CONFIG_ARG_NAME), t.identifier(WIRE_CONFIG_COMPUTED_KEYS_NAME)]
            : [t.identifier(WIRE_CONFIG_ARG_NAME)],
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

            if (wiredValue.computed?.length) {
                wireConfig.push(
                    t.objectProperty(
                        t.identifier('computed'),
                        t.arrayExpression(wiredValue.computed)
                    )
                );
            }

            if (wiredValue.params?.length) {
                const dynamicParamNames = wiredValue.params.map((prop) => {
                    const { computed, key } = prop;
                    if (computed) {
                        // Computed dynamic params have all been normalized to `$keys[0]`
                        // Extract just the index because this array won't have access to `$keys`
                        return (key as types.MemberExpression & { property: types.NumericLiteral })
                            .property;
                    } else if (t.isIdentifier(key)) {
                        // regular prop, {foo: bar}
                        return t.stringLiteral(key.name);
                    } else {
                        // Key should have been normalized earlier to only be a string literal
                        return t.stringLiteral(String((key as types.StringLiteral).value));
                    }
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
    /** Computed property keys (excludes primitive literals). */
    computed?: types.Expression[];
    /** Properties without observed values ({x: 123}). */
    static?: types.ObjectExpression['properties'];
    /** Properties with observed values ({key: '$prop'}). */
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
        const isClassMethod = path.parentPath.isClassMethod({ kind: 'method' });

        const wiredValue: WiredValue = {
            propertyName,
            isClassMethod,
            ...(config && parseWiredParams(t, config)),
        };

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
