/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { DecoratorErrors } = require('@lwc/errors');
const { isWireDecorator } = require('./shared');
const {
    LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR, TRACK_DECORATOR, API_DECORATOR },
} = require('../../constants');
const { generateError } = require('../../utils');

function validateWireParameters(path) {
    const [id, config] = path.get('expression.arguments');

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

    if (isMemberExpression && !id.get('object').isIdentifier()) {
        throw generateError(id, {
            errorInfo: DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS,
        });
    }

    // Ensure wire adapter is imported (check for member expression or identifier)
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
        !path.scope.getBinding(wireBinding).path.isImportSpecifier() &&
        !path.scope.getBinding(wireBinding).path.isImportDefaultSpecifier()
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

function validateUsageWithOtherDecorators(path, decorators) {
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

module.exports = function validate(decorators) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path, decorators);
    });
};
