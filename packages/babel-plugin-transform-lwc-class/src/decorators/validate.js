const { isAPIDecorator, isTrackDecorator, isWireDecorator } = require('../utils');

const decoratorVisitor = {
    Decorator(path) {
        if (isWireDecorator(path)) {
            const decorators = path.parentPath.get('decorators');
            if (decorators.length > 1) {
                decorators.forEach((decorator) => {
                    if (isAPIDecorator(decorator) || isTrackDecorator(decorator)) {
                        throw path.buildCodeFrameError(`@wire method or property cannot be used with @${decorator.node.expression.name}`);
                    } else if (isWireDecorator(decorator) && decorator.node !== path.node) {
                        throw path.buildCodeFrameError(`Method or property can only have 1 @wire decorator`);
                    }
                })
            }
        } else if (isAPIDecorator(path)) {
            const decorators = path.parentPath.get('decorators');
            if (decorators.length > 1) {
                decorators.forEach((decorator) => {
                    if (isTrackDecorator(decorator)) {
                        throw path.buildCodeFrameError('@api method or property cannot be used with @track');
                    }
                })
            }
        }
    }
};

module.exports = function validateDecorators ({ types }) {
    return {
        Class(path) {
            const classBody = path.get('body');
            path.traverse(decoratorVisitor);
        },
    };
};