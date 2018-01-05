const track = require('./track');
const { RAPTOR_PACKAGE_EXPORTS: { API_DECORATOR, TRACK_DECORATOR, WIRE_DECORATOR } } = require('../constants');

function validateApiUsage(decorators) {
    decorators.filter(decorator => (
        decorator.type === API_DECORATOR
    )).forEach(apiDecorator => {
        const isPublicFieldTracked = decorators.some(decorator => (
            decorator.type === TRACK_DECORATOR
            && decorator.path.parentPath.node === apiDecorator.path.parentPath.node
        ));

        if (isPublicFieldTracked) {
            throw apiDecorator.path.buildCodeFrameError('@api method or property cannot be used with @track');
        }
    });
}

function validateWireUsage(decorators) {
    decorators.filter(decorator => (
        decorator.type === WIRE_DECORATOR
    )).forEach(wireDecorator => {
        decorators.forEach(decorator => {
            if (wireDecorator !== decorator
                && decorator.type === WIRE_DECORATOR) {
                throw wireDecorator.path.buildCodeFrameError('Method or property can only have 1 @wire decorator');
            }
            if ((decorator.type === API_DECORATOR || decorator.type === TRACK_DECORATOR)
                && decorator.path.parentPath.node === wireDecorator.path.parentPath.node) {
                throw wireDecorator.path.buildCodeFrameError(`@wire method or property cannot be used with @${decorator.type}`);
            }
        });
    });
}

/** Assert there is no conflict in the usage of decorators */
module.exports = function validateDecoratorCombination(klass, decorators) {
    validateApiUsage(decorators);
    validateWireUsage(decorators);

    track.validate(klass, decorators);
}
