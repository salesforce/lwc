const component = require('./component');
const apiDecorator = require('./decorators/api');
const wireDecorator = require('./decorators/wire');
const trackDecorator = require('./decorators/track');
const classProperties = require('./class-properties');
const validateDecorators = require('./decorators/validate');

module.exports = function ({ types, traverse }) {
    const { merge: mergeVisitors } = traverse.visitors;

    const baseVisitor = {
        Program: {
            enter(_, state) {
                state.file.metadata.labels = [];
                state.file.metadata.apiProperties = [];
            }
        }
    };

    return {
        name: 'raptor-class-transform',
        visitor: mergeVisitors([
            baseVisitor,
            validateDecorators({ types }),
            apiDecorator({ types }),
            wireDecorator({ types }),
            trackDecorator({ types }),
            component({ types }),
            classProperties({ types }),
        ])
    }
}
