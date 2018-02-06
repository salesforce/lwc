const { isWireDecorator } = require('./shared');
const { LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR, TRACK_DECORATOR, API_DECORATOR } } = require('../../constants');

function validateWireParameters(path) {
    const [id, config] = path.get('expression.arguments');

    if (!id || !config) {
        throw path.buildCodeFrameError(
            `@wire(<adapterId>, <adapterConfig>) expects 2 parameters.`
        );
    }

    // TODO: deprecate string as adapter id once consumer has migrated to use imported identifier
    if (!id.isStringLiteral() && !id.isIdentifier()) {
        throw id.buildCodeFrameError(
            `@wire expects a string or a function identifier as first parameter.`
        );
    }

    if (id.isIdentifier() && !path.scope.getBinding(id.node.name).path.isImportSpecifier()) {
        throw id.buildCodeFrameError(
            `@wire expects a function identifier to be imported as first parameter.`
        );
    }

    if (!config.isObjectExpression()) {
        throw config.buildCodeFrameError(
            `@wire expects a configuration object expression as second parameter.`
        );
    }
}

function validateUsageWithOtherDecorators(path, decorators) {
    decorators.forEach(decorator => {
        if (path !== decorator.path
            && decorator.name === WIRE_DECORATOR
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw path.buildCodeFrameError('Method or property can only have 1 @wire decorator');
        }
        if ((decorator.name === API_DECORATOR || decorator.name === TRACK_DECORATOR)
            && decorator.path.parentPath.node === path.parentPath.node) {
            throw path.buildCodeFrameError(`@wire method or property cannot be used with @${decorator.name}`);
        }
    });
}

module.exports = function validate(klass, decorators) {
    decorators.filter(isWireDecorator).forEach(({ path }) => {
        validateUsageWithOtherDecorators(path, decorators);
        validateWireParameters(path, decorators);
    });
}
