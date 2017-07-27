const component = require('./component');
const apiDecorator = require('./decorators/api');
const wireDecorator = require('./decorators/wire');
const classProperties = require('./class-properties');

module.exports = function ({ types, traverse }) {
    const { merge: mergeVisitors } = traverse.visitors;

    const baseVisitor = {
        Program: {
            enter(_, state) {
                state.metadata = {
                    labels: [],
                    isComponent: false,
                };
            },
        },
    };

    return {
        name: 'raptor-class-transform',
        visitor: mergeVisitors([
            baseVisitor,
            apiDecorator({ types }),
            wireDecorator({ types }),
            component({ types }),
            classProperties({ types }),
        ]),
    }
}
