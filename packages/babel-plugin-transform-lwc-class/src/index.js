const component = require('./component');
const decorators = require('./decorators');
const apiDecorator = require('./decorators/api');
const wireDecorator = require('./decorators/wire');
const classProperties = require('./class-properties');

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
            decorators({ types }),
            apiDecorator({ types }),
            wireDecorator({ types }),
            component({ types }),
            classProperties({ types }),
        ])
    }
}
