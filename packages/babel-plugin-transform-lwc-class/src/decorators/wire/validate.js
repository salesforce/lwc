const { isWireDecorator } = require('./shared');
const { LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR, TRACK_DECORATOR, API_DECORATOR } } = require('../../constants');
const { DecoratorErrors, normalizeErrorMessage } = require('lwc-errors');

function validateWireParameters(path) {
    const [id, config] = path.get('expression.arguments');

    if (!id) {
        throw path.buildCodeFrameError(
            normalizeErrorMessage(DecoratorErrors.ADAPTER_SHOULD_BE_FIRST_PARAMETER)
        );
    }

    if (!id.isIdentifier()) {
        throw id.buildCodeFrameError(
            normalizeErrorMessage(DecoratorErrors.FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER)
        );
    }

    if (id.isIdentifier()
        && !path.scope.getBinding(id.node.name).path.isImportSpecifier()
        && !path.scope.getBinding(id.node.name).path.isImportDefaultSpecifier()) {
        throw id.buildCodeFrameError(
            normalizeErrorMessage(DecoratorErrors.IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER)
        );
    }

    if (config && !config.isObjectExpression()) {
        throw config.buildCodeFrameError(
            normalizeErrorMessage(DecoratorErrors.CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER)
        );
    }
}

function validateUsageWithOtherDecorators(path, decorators) {
    decorators.forEach(decorator => {
        if (path !== decorator.path
            && decorator.name === WIRE_DECORATOR
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw path.buildCodeFrameError(normalizeErrorMessage(DecoratorErrors.ONE_WIRE_DECORATOR_ALLOWED));
        }
        if ((decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR)
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw path.buildCodeFrameError(normalizeErrorMessage(DecoratorErrors.CONFLICT_WITH_ANOTHER_DECORATOR, [decorator.name]));
        }
    });
}

module.exports = function validate(klass, decorators) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path, decorators);
    });
}
