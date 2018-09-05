const classProperty = require('@babel/plugin-proposal-class-properties')["default"];
const metadata = require('./metadata');
const component = require('./component');
const decorators = require('./decorators');

const { LWC_DECORATORS, LWC_PACKAGE_ALIAS } = require('./constants');

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    const { merge: mergeVisitors } = api.traverse.visitors;

    const { visitor: classPropertyVisitor } = classProperty(api, {
        loose: true,
    });

    const visitors = [
        metadata(api, config),
        namespace(api, config),
        decorators(api, config),
        component(api, config),
        {
            Program: {
                exit(path, state) {
                    const exitVisitors = mergeVisitors(classPropertyVisitor, unusedDecoratorVisitor)
                    path.traverse(exitVisitors, state);
                },
            },
        },
    ];

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push(['decorators', { decoratorsBeforeExport: true }]);
            parserOpts.plugins.push('classProperties');
            parserOpts.plugins.push('dynamicImport');
        },
        visitor: mergeVisitors(visitors),
    };
};

function unusedDecoratorVisitor({ types: t }) {
    return {
        Decorator(path) {
            const { name } = path.node.expression;
            throw path.parentPath.buildCodeFrameError(
                `Invalid "${name}" decorator usage. Supported decorators (${LWC_DECORATORS.join(', ')}) should be imported from "${LWC_PACKAGE_ALIAS}"`,
            );
        }
    }
}
