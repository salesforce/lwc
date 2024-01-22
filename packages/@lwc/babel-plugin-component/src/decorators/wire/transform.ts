/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { types } from '@babel/core';
import { NodePath, Scope } from '@babel/traverse';
import { LWC_COMPONENT_PROPERTIES } from '../../constants';
import { DecoratorMeta } from '../index';
import { BabelTypes } from '../../types';
import { BindingOptions } from '../types';
import { isWireDecorator } from './shared';

const WIRE_PARAM_PREFIX = '$';
const WIRE_CONFIG_ARG_NAME = '$cmp';

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

    if (wiredValue.static) {
        Array.prototype.push.apply(configProps, wiredValue.static);
    }

    if (wiredValue.params) {
        wiredValue.params.forEach((param) => {
            const memberExprPaths = ((param as any).value.value as string).split('.');
            const paramConfigValue = generateParameterConfigValue(memberExprPaths);

            configProps.push(
                t.objectProperty(
                    (param as types.ObjectProperty).key,
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
        [t.identifier(WIRE_CONFIG_ARG_NAME)],
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

            if (wiredValue.params) {
                const dynamicParamNames = wiredValue.params.map((p) => {
                    if (t.isIdentifier(p.key)) {
                        return p.computed ? t.identifier(p.key.name) : t.stringLiteral(p.key.name);
                    } else if (
                        t.isLiteral(p.key) &&
                        // Template literals may contain expressions, so they are not allowed
                        !t.isTemplateLiteral(p.key) &&
                        // RegExp are not primitives, so they are not allowed
                        !t.isRegExpLiteral(p.key)
                    ) {
                        const value = t.isNullLiteral(p.key) ? null : p.key.value;
                        return t.stringLiteral(String(value));
                    }
                    // If it's not an identifier or primitive literal then it's a computed expression
                    throw new TypeError(
                        `Expected object property key to be an identifier or a literal, but instead saw "${p.key.type}".`
                    );
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

const scopedReferenceLookup = (scope: Scope) => (name: string) => {
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
            NodePath<types.ObjectExpression> | undefined
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
