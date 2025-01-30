/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { LWC_PACKAGE_EXPORTS } from '../../constants';
import { generateError } from '../../utils';
import { isWireDecorator } from './shared';
import type { types, NodePath } from '@babel/core';
import type { LwcBabelPluginPass } from '../../types';
import type { DecoratorMeta } from '../index';

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

    let adapter: NodePath<types.Identifier>;

    if (id.isIdentifier()) {
        // @wire(adapter)
        adapter = id;
    } else if (id.isMemberExpression()) {
        if (id.node.computed) {
            // @wire(adapter[computed])
            throw generateError(
                id,
                {
                    errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS,
                },
                state
            );
        }

        const object = id.get('object');

        if (object.isIdentifier()) {
            // @wire(adapter.foo)
            adapter = object;
        } else {
            // @wire(adapter.foo.bar)
            throw generateError(
                id,
                {
                    errorInfo:
                        DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS,
                },
                state
            );
        }
    } else {
        // @wire(1), @wire('adapter'), @wire(function adapter() {}), etc.
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
            },
            state
        );
    }

    // Ensure wire adapter is imported (check for member expression or identifier)
    const adapterBinding = path.scope.getBinding(adapter.node.name);
    if (!adapterBinding) {
        throw generateError(
            id,
            {
                errorInfo: DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED,
                messageArgs: [adapter.node.name],
            },
            state
        );
    }

    // ensure wire adapter is a first parameter
    if (
        !adapterBinding.path.isImportSpecifier() &&
        !adapterBinding.path.isImportDefaultSpecifier()
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
