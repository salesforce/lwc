const { isWireDecorator } = require('./shared');
const { LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR, TRACK_DECORATOR, API_DECORATOR } } = require('../../constants');
const { DecoratorErrors, generateCompilerError } = require('lwc-errors');

function validateWireParameters(path) {
    const [id, config] = path.get('expression.arguments');

    if (!id) {
        throw generateCompilerError(
            DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER,
            [], {},
            path.buildCodeFrameError.bind(path)
        );
    }

    if (!id.isIdentifier()) {
        throw generateCompilerError(
            DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
            [], {},
            id.buildCodeFrameError.bind(id)
        );
    }

    if (id.isIdentifier()
        && !path.scope.getBinding(id.node.name).path.isImportSpecifier()
        && !path.scope.getBinding(id.node.name).path.isImportDefaultSpecifier()) {
        throw generateCompilerError(
            DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER,
            [], {},
            id.buildCodeFrameError.bind(id)
        );
    }

    if (config && !config.isObjectExpression()) {
        throw generateCompilerError(
            DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER,
            [], {},
            config.buildCodeFrameError.bind(config)
        );
    }
}

function validateUsageWithOtherDecorators(path, decorators) {
    decorators.forEach(decorator => {
        if (path !== decorator.path
            && decorator.name === WIRE_DECORATOR
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw generateCompilerError(
                DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED,
                [], {},
                path.buildCodeFrameError.bind(path)
            );
        }
        if ((decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR)
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw generateCompilerError(
                DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR,
                [decorator.name], {},
                path.buildCodeFrameError.bind(path)
            );
        }
    });
}

module.exports = function validate(klass, decorators) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path, decorators);
    });
}
