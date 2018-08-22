const classProperty = require("@babel/plugin-proposal-class-properties")[
    "default"
];
const metadata = require("./metadata");
const component = require("./component");
const decorators = require("./decorators");

const GENERIC_NAMESPACE_MODULE_PREFIX = "c/";
const SAME_NAMESPACE_MODULE_IMPORT_DELIMITER = "/";
const SAME_NAMESPACE_MODULE_IMPORT_REGEX = /(c\/)?/;


/**
 * Replace authored generic namespace reference 'c-' with real namespace
 *
 * same namespace import ex:
 * From: import { method } from 'c/utils.js';
 * To:   import { method } from 'namespace/utils.js
 *
 * same namespace module import
 */
function namespaceReplaceVisitor(namespace) {
    if (!namespace) {
        return null;
    }
    return {
        ImportDeclaration(path) {
            if (!path.node || !path.node.source) {
                return;
            }

            const { node: { source } } = path;
            const { value } = source;

            if (
                value.startsWith(GENERIC_NAMESPACE_MODULE_PREFIX) &&
                value.length > GENERIC_NAMESPACE_MODULE_PREFIX.length
            ) {
                source.value = value.replace(
                    SAME_NAMESPACE_MODULE_IMPORT_REGEX,
                    namespace + SAME_NAMESPACE_MODULE_IMPORT_DELIMITER
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

    // perform import namespace replacement
    const { namespace } = config;
    if (namespace && namespace.length > 0 && namespace !== GENERIC_NAMESPACE_MODULE_PREFIX) {
        visitors.unshift(namespaceReplaceVisitor(namespace));
    }

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push("decorators");
            parserOpts.plugins.push("classProperties");
        },
        visitor: mergeVisitors(visitors)
    };
};
