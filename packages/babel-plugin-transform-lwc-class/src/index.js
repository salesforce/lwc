const component = require('./component');
const decorators = require('./decorators');
const classProperties = require('./class-properties');

module.exports = function ({ types, traverse }) {
    const { merge: mergeVisitors } = traverse.visitors;

    return {
        name: 'raptor-class-transform',
        visitor: mergeVisitors([
            decorators({ types }),
            component({ types }),
            classProperties({ types }),
        ])
    }
}
