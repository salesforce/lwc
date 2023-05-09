/*
 * Copyright (c) 2023, salesforce.com, inc.
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

function validateWireParameters(path: NodePath, state: LwcBabelPluginPass) {
    const [id, config] = path.get('expression.arguments') as [
        NodePath | undefined,
        NodePath<types.ObjectExpression> | undefined
    ];

    if (!id) {
        throw generateError(
            path,
            {
                errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER,
            },
            state
        );
    }

    const isIdentifier = id.isIdentifier();
    const isMemberExpression = id.isMemberExpression();

    if (!isIdentifier && !isMemberExpression) {
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
    // @ts-ignore
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
    // @ts-ignore
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

    if (config && !config.isObjectExpression()) {
        throw generateError(
            config,
            {
                errorInfo: DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER,
            },
            state
        );
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
