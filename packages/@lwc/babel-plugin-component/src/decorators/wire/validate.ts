/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { types } from '@babel/core';
import { NodePath } from '@babel/traverse';
import { DecoratorErrors } from '@lwc/errors';
import { LWC_PACKAGE_EXPORTS } from '../../constants';
import { generateError } from '../../utils';
import { LwcBabelPluginPass } from '../../types';
import { DecoratorMeta } from '../index';
import { isWireDecorator } from './shared';

const { TRACK_DECORATOR, WIRE_DECORATOR, API_DECORATOR } = LWC_PACKAGE_EXPORTS;

function validateWireId(id: NodePath | undefined, path: NodePath, state: LwcBabelPluginPass) {
    if (!id) {
        throw generateError(
            path,
            {
                errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER,
            },
            state
        );
    }

    const isMemberExpression = id.isMemberExpression();

    if (!id.isIdentifier() && !isMemberExpression) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
            },
            state
        );
    }

    if (id.isMemberExpression({ computed: true })) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS,
            },
            state
        );
    }

    // TODO [#3444]: improve member expression computed typechecking
    // @ts-expect-error type narrowing incorrectly reduces id to `never`
    if (isMemberExpression && !id.get('object').isIdentifier()) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS,
            },
            state
        );
    }

    // TODO [#3444]: improve member expression computed typechecking
    // Ensure wire adapter is imported (check for member expression or identifier)
    // @ts-expect-error type narrowing incorrectly reduces id to `never`
    const wireBinding = isMemberExpression ? id.node.object.name : id.node.name;
    if (!path.scope.getBinding(wireBinding)) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED,
                messageArgs: [id.node.name],
            },
            state
        );
    }

    // ensure wire adapter is a first parameter
    if (
        wireBinding &&
        !path.scope.getBinding(wireBinding)!.path.isImportSpecifier() &&
        !path.scope.getBinding(wireBinding)!.path.isImportDefaultSpecifier()
    ) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
            },
            state
        );
    }
}

function validateWireConfig(config: NodePath, path: NodePath, state: LwcBabelPluginPass) {
    if (!config.isObjectExpression()) {
        throw generateError(
            config,
            {
                errorInfo: DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER,
            },
            state
        );
    }

    for (const prop of config.get('properties')) {
        // Only validate {[computed]: true} object properties; {static: true} props are all valid
        // and we ignore {...spreads} and {methods(){}}
        if (!prop.isObjectProperty() || !prop.node.computed) continue;

        const key: NodePath = prop.get('key');
        if (key.isIdentifier()) {
            // Only allow identifiers that originated from a `const` declaration
            const binding = key.scope.getBinding(key.node.name);
            // TODO [#3956]: Investigate allowing imported constants
            if (binding?.kind === 'const') continue;
            // By default, the identifier `undefined` has no binding (when it's actually undefined),
            // but has a binding if it's used as a variable (e.g. `let undefined = "don't do this"`)
            if (key.node.name === 'undefined' && !binding) continue;
        } else if (key.isLiteral()) {
            // A literal can be a regexp, template literal, or primitive; only allow primitives
            if (key.isTemplateLiteral()) {
                // A template literal is not guaranteed to always result in the same value
                // (e.g. `${Math.random()}`), so we disallow them entirely.
                // TODO [#3956]: Investigate allowing template literals
                throw generateError(
                    key,
                    {
                        errorInfo: DecoratorErrors.COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL,
                    },
                    state
                );
            } else if (!key.isRegExpLiteral()) {
                continue;
            }
        }

        throw generateError(
            key,
            {
                errorInfo: DecoratorErrors.COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL,
            },
            state
        );
    }
}

function validateWireParameters(path: NodePath, state: LwcBabelPluginPass) {
    const expressionArguments = path.get('expression.arguments');
    if (Array.isArray(expressionArguments)) {
        // Multiple arguments: should be [id, config?]
        const [id, config] = expressionArguments;
        validateWireId(id, path, state);
        if (config) validateWireConfig(config, path, state);
    } else {
        // Single argument: should just be id
        validateWireId(expressionArguments, path, state);
    }
}

function validateUsageWithOtherDecorators(
    path: NodePath<types.Decorator>,
    decorators: DecoratorMeta[],
    state: LwcBabelPluginPass
) {
    decorators.forEach((decorator) => {
        if (
            path !== decorator.path &&
            decorator.name === WIRE_DECORATOR &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateError(
                path,
                {
                    errorInfo: DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED,
                },
                state
            );
        }
        if (
            (decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR) &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateError(
                path,
                {
                    errorInfo: DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR,
                    messageArgs: [decorator.name],
                },
                state
            );
        }
    });
}

export default function validate(decorators: DecoratorMeta[], state: LwcBabelPluginPass) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators, state);
        validateWireParameters(path, state);
    });
}
