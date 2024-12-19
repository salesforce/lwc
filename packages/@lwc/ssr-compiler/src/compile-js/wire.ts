/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is, builders as b } from 'estree-toolkit';
import { produce } from 'immer';
import { DecoratorErrors } from '@lwc/errors';
import { esTemplate } from '../estemplate';
import { generateError } from './errors';
import type { NodePath } from 'estree-toolkit';
import type {
    PropertyDefinition,
    ObjectExpression,
    MethodDefinition,
    ExpressionStatement,
    Expression,
    Identifier,
    MemberExpression,
    Property,
    BlockStatement,
} from 'estree';
import type { ComponentMetaState, WireAdapter } from './types';

interface NoSpreadObjectExpression extends Omit<ObjectExpression, 'properties'> {
    properties: Property[];
}

function bMemberExpressionChain(props: string[]): MemberExpression {
    // Technically an incorrect assertion, but it works fine...
    let expr: MemberExpression = b.identifier('instance') as any;
    for (const prop of props) {
        expr = b.memberExpression(expr, b.literal(prop), true);
    }
    return expr;
}

function getWireParams(
    node: MethodDefinition | PropertyDefinition
): [Expression, Expression | undefined] {
    const { decorators } = node;

    if (decorators.length > 1) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw generateError(DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED);
    }

    // validate the parameters
    const wireDecorator = decorators[0].expression;
    if (!is.callExpression(wireDecorator)) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw new Error('todo - invalid usage');
    }

    const args = wireDecorator.arguments;
    if (args.length === 0 || args.length > 2) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw new Error('todo - wrong number of args');
    }

    const [id, config] = args;
    if (is.spreadElement(id) || is.spreadElement(config)) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw new Error('todo - spread in params');
    }
    return [id, config];
}

function validateWireId(
    id: Expression,
    path: NodePath<PropertyDefinition | MethodDefinition>
): asserts id is Identifier | MemberExpression {
    // name of identifier or object used in member expression (e.g. "foo" for `foo.bar`)
    let wireAdapterVar: string;

    if (is.memberExpression(id)) {
        if (id.computed) {
            // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
            throw new Error('todo - FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS');
        }
        if (!is.identifier(id.object)) {
            // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
            throw new Error('todo - FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS');
        }
        wireAdapterVar = id.object.name;
    } else if (!is.identifier(id)) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw new Error('todo - invalid adapter name');
    } else {
        wireAdapterVar = id.name;
    }

    // This is not the exact same validation done in @lwc/babel-plugin-component but it accomplishes the same thing
    if (path.scope?.getBinding(wireAdapterVar)?.kind !== 'module') {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw generateError(DecoratorErrors.COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL);
    }
}

function validateWireConfig(
    config: Expression,
    path: NodePath<PropertyDefinition | MethodDefinition>
): asserts config is NoSpreadObjectExpression {
    if (!is.objectExpression(config)) {
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw new Error('todo - CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER');
    }
    for (const property of config.properties) {
        // Only validate computed object properties because static props are all valid
        // and we ignore {...spreads} and {methods(){}}
        if (!is.property(property) || !property.computed) continue;
        const key = property.key;
        if (is.identifier(key)) {
            const binding = path.scope?.getBinding(key.name);
            // TODO [#3956]: Investigate allowing imported constants
            if (binding?.kind === 'const') continue;
            // By default, the identifier `undefined` has no binding (when it's actually undefined),
            // but has a binding if it's used as a variable (e.g. `let undefined = "don't do this"`)
            if (key.name === 'undefined' && !binding) continue;
        } else if (is.literal(key)) {
            if (is.templateLiteral(key)) {
                // A template literal is not guaranteed to always result in the same value
                // (e.g. `${Math.random()}`), so we disallow them entirely.
                // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
                throw new Error('todo - COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL');
            } else if (!('regex' in key)) {
                // A literal can be a regexp, template literal, or primitive; only allow primitives
                continue;
            }
        } else if (is.templateLiteral(key)) {
            // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
            throw generateError(DecoratorErrors.COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL);
        }
        // TODO [#5032]: Harmonize errors thrown in `@lwc/ssr-compiler`
        throw generateError(DecoratorErrors.COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL);
    }
}

export function catalogWireAdapters(
    path: NodePath<PropertyDefinition | MethodDefinition>,
    state: ComponentMetaState
) {
    const node = path.node!;
    const [id, config] = getWireParams(node);
    validateWireId(id, path);
    let reactiveConfig: ObjectExpression;
    if (config) {
        validateWireConfig(config, path);
        reactiveConfig = produce(config, (draft) => {
            // replace '$foo' values with `instance.foo`; preserve everything else
            for (const prop of draft.properties) {
                const { value } = prop;
                if (
                    is.literal(value) &&
                    typeof value.value === 'string' &&
                    value.value.startsWith('$') &&
                    value.value.length > 1
                ) {
                    prop.value = bMemberExpressionChain(value.value.slice(1).split('.'));
                }
            }
        });
    } else {
        // FIXME: for `@wire(Adapter), does engine-server use `undefined` or `{}` for config?
        reactiveConfig = b.objectExpression([]); // empty object
    }

    state.wireAdapters = [
        ...state.wireAdapters,
        { adapterId: id, config: reactiveConfig, field: node },
    ];
}

const bSetWiredProp = esTemplate`
    instance.${/*wire-decorated property*/ is.identifier} = newValue
`<ExpressionStatement>;

const bCallWiredMethod = esTemplate`
    instance.${/*wire-decorated method*/ is.identifier}(newValue)
`<ExpressionStatement>;

const bWireAdapterPlumbing = esTemplate`{
    const wireInstance = new ${/*wire adapter constructor*/ is.expression}((newValue) => {
        ${/*update the decorated property or call the decorated method*/ is.expressionStatement};
    });
    wireInstance.connect?.();
    if (wireInstance.update) {
        const getLiveConfig = () => {
            return ${/* reactive wire config */ is.objectExpression};
        };
        // This may look a bit weird, in that the 'update' function is called twice: once with
        // an 'undefined' value and possibly again with a context-provided value. While weird,
        // this preserves the behavior of the browser-side wire implementation as well as the
        // original SSR implementation.
        wireInstance.update(getLiveConfig(), undefined);
        __connectContext(${/*wire adapter constructor*/ 0}, instance, (newContextValue) => {
            wireInstance.update(getLiveConfig(), newContextValue);
        });
    }
}`<BlockStatement>;

export function bWireAdaptersPlumbing(adapters: WireAdapter[]): BlockStatement[] {
    return adapters.map(({ adapterId, config, field }) => {
        const actionUponNewValue =
            is.methodDefinition(field) && field.kind === 'method'
                ? // Validation in compile-js/index.ts `visitors` ensures `key` is an identifier
                  bCallWiredMethod(field.key as Identifier)
                : bSetWiredProp(field.key as Identifier);

        return bWireAdapterPlumbing(adapterId, actionUponNewValue, config);
    });
}
