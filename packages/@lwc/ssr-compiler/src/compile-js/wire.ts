/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b, NodePath } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { isValidIdentifier } from '../shared';

import type {
    PropertyDefinition,
    ObjectExpression,
    Statement,
    MethodDefinition,
    ExpressionStatement,
} from 'estree';
import type { ComponentMetaState, WireAdapter } from './types';

function extractWireConfig(
    fieldName: string,
    adapterConstructorId: string,
    fieldType: 'method' | 'property',
    config?: ObjectExpression
): WireAdapter {
    const extractedConfig =
        config?.properties?.map?.((objProp) => {
            if (is.property(objProp)) {
                const { key, value } = objProp;
                if (is.literal(value) && typeof value.value === 'string') {
                    const referencedField = value.value.slice(1);
                    return {
                        configKey: key.name,
                        referencedField,
                    };
                }
            }
        }) ?? [];

    return {
        fieldName,
        fieldType,
        adapterConstructorId,
        config: extractedConfig,
    };
}

export function catalogWireAdapters(
    path: NodePath<PropertyDefinition | MethodDefinition>,
    state: ComponentMetaState,
) {
    const node = path.node!;
    const { decorators } = node;

    if (decorators.length > 1) {
        throw new Error('todo - multiple decorators at once');
    }

    // validate the parameters
    const wireDecorator = decorators[0].expression;
    if (!is.callExpression(wireDecorator)) {
        throw new Error('todo - invalid usage');
    }

    const args = wireDecorator.arguments;
    if (args.length === 0 || args.length > 2) {
        throw new Error('todo - wrong number of args');
    }

    const [id, config] = args;
    if (is.spreadElement(id) || is.spreadElement(config)) {
        throw new Error('todo - spread in params');
    }

    let wireBinding;

    // validate id
    if (is.memberExpression(id)) {
        if (id.computed) {
            throw new Error('todo - FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS');
        }
        if (!is.identifier(id.object)) {
            throw new Error('todo - FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS');
        }
        wireBinding = id.object.name;
    } else if (!is.identifier(id)) {
        throw new Error('todo - invalid adapter name');
    } else {
        wireBinding = id.name;
    }

    // This is not the exact same validation done in @lwc/babel-plugin-component but it accomplishes the same thing
    if (path.scope?.getBinding(wireBinding)?.kind !== 'module') {
        throw new Error('todo - WIRE_ADAPTER_SHOULD_BE_IMPORTED');
    }

    if (config) {
        if (!is.objectExpression(config)) {
            throw new Error('todo - CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER');
        }
        for (const property of config.properties) {
            if (!is.property(property) || !property.computed) continue;
            const key = property.key;
            if (is.identifier(key)) {
                const binding = path.scope.getBinding(key.name);
                // TODO [#3956]: Investigate allowing imported constants
                if (binding?.kind === 'const') continue;
                // By default, the identifier `undefined` has no binding (when it's actually undefined),
                // but has a binding if it's used as a variable (e.g. `let undefined = "don't do this"`)
                if (key.name === 'undefined' && !binding) continue;
            } else if (is.literal(key)) {
                if (is.templateLiteral(key)) {
                    // A template literal is not guaranteed to always result in the same value
                    // (e.g. `${Math.random()}`), so we disallow them entirely.
                    throw new Error('todo - COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL');
                } else if ('regex' in key) {
                    continue;
                }
            }
        }
        throw new Error('todo - COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL');
    }

    state.wireAdapters = [
        ...state.wireAdapters,
        // extractWireConfig(name, adapterConstructorId.name, fieldtype, config),
    ];
}

function bWireConfigObj(adapter: WireAdapter) {
    return b.objectExpression(
        adapter.config.map(({ configKey, referencedField }) =>
            b.property(
                'init',
                b.identifier(configKey),
                b.memberExpression(b.identifier('instance'), b.identifier(referencedField))
            )
        )
    );
}

const bSetWiredProp = esTemplate`
    instance.${/*wire-decorated property*/ is.identifier} = newValue
`<ExpressionStatement>;

const bCallWiredMethod = esTemplate`
    instance.${/*wire-decorated method*/ is.identifier}(newValue)
`<ExpressionStatement>;

const bWireAdapterPlumbing = esTemplate`
    const wireInstance = new ${/*wire adapter constructor*/ is.identifier}((newValue) => {
        ${/*update the decorated property or call the decorated method*/ is.expressionStatement};
    });
    wireInstance.connect?.();
    if (wireInstance.update) {
        const wireConfigObj = ${/*mapping from lwc fields to wire config keys*/ is.objectExpression};

        // This may look a bit weird, in that the 'update' function is called twice: once with
        // an 'undefined' value and possibly again with a context-provided value. While weird,
        // this preserves the behavior of the browser-side wire implementation as well as the
        // original SSR implementation.
        wireInstance.update(wireConfigObj, undefined);
        __connectContext(${/*wire adapter constructor*/ 0}, instance, (newContextValue) => {
            const wireConfigObj = ${/*mapping from lwc fields to wire config keys*/ 2};
            wireInstance.update(wireConfigObj, newContextValue);
        });
    }
`<Statement[]>;

export function bWireAdaptersPlumbing(adapters: WireAdapter[]): Statement[] {
    return adapters.map((adapter) => {
        const { adapterConstructorId, fieldName } = adapter;

        const actionUponNewValue =
            adapter.fieldType === 'method'
                ? bCallWiredMethod(b.identifier(fieldName))
                : bSetWiredProp(b.identifier(fieldName));

        return b.blockStatement(
            bWireAdapterPlumbing(
                b.identifier(adapterConstructorId),
                actionUponNewValue,
                bWireConfigObj(adapter)
            )
        );
    });
}
