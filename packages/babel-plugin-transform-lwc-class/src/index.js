const classProperty = require('@babel/plugin-proposal-class-properties')["default"];
const metadata = require('./metadata');
const component = require('./component');
const decorators = require('./decorators');

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    const { merge: mergeVisitors } = api.traverse.visitors;

    const { visitor: classPropertyVisitor } = classProperty(api, { loose: true });

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('decorators');
            parserOpts.plugins.push('classProperties');
        },
        visitor: mergeVisitors([
            metadata(api),
            decorators(api),
            component(api),
            {
                Program: {
                    exit(path, state) {
                        path.traverse(
                            classPropertyVisitor,
                            state
                        );
                    }
                }
            },
        ])
    }
}
