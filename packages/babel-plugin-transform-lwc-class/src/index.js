const classProperty = require('@babel/plugin-proposal-class-properties')["default"];
const metadata = require('./metadata');
const component = require('./component');
const decorators = require('./decorators');

/**
 * Replace authored generic namespace reference
 *
 * same namespace import ex:
 * From: import { method } from 'c-utils';
 * To:   import { method } from 'namespace-utils'
 *
 * same namespace module import
 */
function namespaceReplaceVisitor(oldNamespace, newNamespace) {
    if (!oldNamespace || !newNamespace || !newNamespace.length) {
        return null;
    }
    return {
        ImportDeclaration(path) {
            if (!path.node || !path.node.source) {
                return;
            }

            const { node: { source } } = path;
            const { value } = source;

            const namespaceToReplace = oldNamespace + '-';
            if (value.startsWith(namespaceToReplace)) {
                const regex = new RegExp(`^(${namespaceToReplace})?`);
                source.value = value.replace(
                    regex,
                    newNamespace + '-'
                );
            }
        }
    };
}

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api, config) {
    const { merge: mergeVisitors } = api.traverse.visitors;

    const { visitor: classPropertyVisitor } = classProperty(api, {
        loose: true
    });
    const visitors = [
        metadata(api),
        decorators(api),
        component(api),
        {
            Program: {
                exit(path, state) {
                    path.traverse(classPropertyVisitor, state);
                }
            }
        }
    ];

    if (config && config.namespaceMapping) {

        // perform import namespace replacement
        const namespaceMapping = config.namespaceMapping || {};

        Object.entries(namespaceMapping).forEach(([oldNamespace, newNamespace]) => {
            const visitor = namespaceReplaceVisitor(oldNamespace, newNamespace);
            if (visitor) {
                visitors.unshift(visitor);
            }
        });
    }

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('decorators');
            parserOpts.plugins.push('classProperties');
        },
        visitor: mergeVisitors(visitors)
    }
}
