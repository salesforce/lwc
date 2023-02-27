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
import { DecoratorMeta } from '../index';
import { isWireDecorator } from './shared';

const { TRACK_DECORATOR, WIRE_DECORATOR, API_DECORATOR } = LWC_PACKAGE_EXPORTS;

function validateWireParameters(path: NodePath) {
    const [id, config] = path.get('expression.arguments') as [
        NodePath,
        NodePath<types.ObjectExpression> | undefined
    ];

    if (!id) {
        throw generateError(path, {
            errorInfo: DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER,
        });
    }

    const isIdentifier = id.isIdentifier();
    const isMemberExpression = id.isMemberExpression();

    if (!isIdentifier && !isMemberExpression) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
        });
    }

    if (id.isMemberExpression({ computed: true })) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS,
        });
    }

    // @ts-ignore
    if (isMemberExpression && !id.get('object').isIdentifier()) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS,
        });
    }

    // Ensure wire adapter is imported (check for member expression or identifier)
    // @ts-ignore
    const wireBinding = isMemberExpression ? id.node.object.name : id.node.name;
    if (!path.scope.getBinding(wireBinding)) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED,
            messageArgs: [id.node.name],
        });
    }

    // ensure wire adapter is a first parameter
    if (
        wireBinding &&
        !path.scope.getBinding(wireBinding)!.path.isImportSpecifier() &&
        !path.scope.getBinding(wireBinding)!.path.isImportDefaultSpecifier()
    ) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
        });
    }

    if (config && !config.isObjectExpression()) {
        throw generateError(config, {
            errorInfo: DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER,
        });
    }
}

function validateUsageWithOtherDecorators(
    path: NodePath<types.Decorator>,
    decorators: DecoratorMeta[]
) {
    decorators.forEach((decorator) => {
        if (
            path !== decorator.path &&
            decorator.name === WIRE_DECORATOR &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateError(path, {
                errorInfo: DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED,
            });
        }
        if (
            (decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR) &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateError(path, {
                errorInfo: DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR,
                messageArgs: [decorator.name],
            });
        }
    });
}

export default function validate(decorators: DecoratorMeta[]) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path);
    });
}
