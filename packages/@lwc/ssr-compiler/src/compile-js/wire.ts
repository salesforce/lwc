/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import { isValidIdentifier } from '../shared';

import type { PropertyDefinition as EsPropertyDefinitionWithDecorators } from 'meriyah/dist/src/estree';
import type {
    Expression,
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
            if (!is.property(objProp)) {
                throw new Error('Object spread syntax is disallowed in @wire config.');
            }
            const { key, value } = objProp;

            if (!is.identifier(key)) {
                throw new Error(`@wire config entry key must be an identifer; found ${key.type}`);
            }
            if (!is.literal(value) || typeof value.value !== 'string' || value.value[0] !== '$') {
                throw new Error('@wire config entry values must be strings starting with a $');
            }
            const referencedField = value.value.slice(1);
            if (!isValidIdentifier(referencedField)) {
                throw new Error(`@wire config referenced invalid field: ${referencedField}`);
            }

            return {
                configKey: key.name,
                referencedField,
            };
        }) ?? [];

    return {
        fieldName,
        fieldType,
        adapterConstructorId,
        config: extractedConfig,
    };
}

export function catalogWireAdapters(
    state: ComponentMetaState,
    node: PropertyDefinition | MethodDefinition
) {
    if (!is.identifier(node.key)) {
        throw new Error(
            'Unimplemented: wires that decorate non-identifiers are not currently supported.'
        );
    }
    const { name } = node.key;

    const { decorators } = node as EsPropertyDefinitionWithDecorators;
    if (decorators?.length !== 1) {
        throw new Error('Only one decorator can be applied to a single field.');
    }

    const expression = decorators[0].expression as Expression;
    if (!is.callExpression(expression)) {
        throw new Error('The @wire decorator must be called.');
    }

    const { arguments: args } = expression;
    const [adapterConstructorId, config] = args;
    if (!is.identifier(adapterConstructorId)) {
        throw new Error('The @wire decorator must reference a wire adapter class.');
    }
    if (config && !is.objectExpression(config)) {
        throw new Error('Invalid config provided to @wire decorator; expected an object literal.');
    }

    const fieldtype =
        node.type === 'MethodDefinition' && node.kind === 'method' ? 'method' : 'property';

    state.wireAdapters = [
        ...state.wireAdapters,
        extractWireConfig(name, adapterConstructorId.name, fieldtype, config),
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
