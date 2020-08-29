/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { isWireDecorator } = require('./shared');
const {
    LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR, TRACK_DECORATOR, API_DECORATOR },
} = require('../../constants');
const { DecoratorErrors } = require('@lwc/errors');
const { generateCodeFrameError } = require('../../utils');

function validateWireParameters(path) {
    const [id, config] = path.get('expression.arguments');

    if (!id) {
        throw generateCodeFrameError(path, DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER());
    }

    const isIdentifier = id.isIdentifier();
    const isMemberExpression = id.isMemberExpression();

    if (!isIdentifier && !isMemberExpression) {
        throw generateCodeFrameError(
            id,
            DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER()
        );
    }

    if (id.isMemberExpression({ computed: true })) {
        throw generateCodeFrameError(
            id,
            DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS()
        );
    }

    if (isMemberExpression && !id.get('object').isIdentifier()) {
        throw generateCodeFrameError(
            id,
            DecoratorErrors.FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS()
        );
    }

    // Ensure wire adapter is imported (check for member expression or identifier)
    const wireBinding = isMemberExpression ? id.node.object.name : id.node.name;
    if (!path.scope.getBinding(wireBinding)) {
        throw generateCodeFrameError(
            id,
            DecoratorErrors.WIRE_ADAPTER_SHOULD_BE_IMPORTED(id.node.name)
        );
    }

    // ensure wire adapter is a first parameter
    if (
        wireBinding &&
        !path.scope.getBinding(wireBinding).path.isImportSpecifier() &&
        !path.scope.getBinding(wireBinding).path.isImportDefaultSpecifier()
    ) {
        throw generateCodeFrameError(
            id,
            DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER()
        );
    }

    if (config && !config.isObjectExpression()) {
        throw generateCodeFrameError(
            config,
            DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER()
        );
    }
}

function validateUsageWithOtherDecorators(path, decorators) {
    decorators.forEach((decorator) => {
        if (
            path !== decorator.path &&
            decorator.name === WIRE_DECORATOR &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateCodeFrameError(path, DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED());
        }
        if (
            (decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR) &&
            decorator.path.parentPath.node === path.parentPath.node
        ) {
            throw generateCodeFrameError(
                path,
                DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR(decorator.name)
            );
        }
    });
}

module.exports = function validate(klass, decorators) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path, decorators);
    });
};
