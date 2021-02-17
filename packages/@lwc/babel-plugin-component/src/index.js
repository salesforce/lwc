/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const component = require('./component');
const { decorators } = require('./decorators');
const { exit } = require('./post-process');
const dynamicImports = require('./dynamic-imports');

function visitProgram(mergedVisitors, stage, path, state) {
    if (mergedVisitors.Program) {
        const visitors = mergedVisitors.Program[stage] || [];

        for (let i = 0, n = visitors.length; i < n; i++) {
            visitors[i](path, state);
        }
    }
}

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    const mergedVisitors = api.traverse.visitors.merge([
        decorators(api),
        component(api),
        dynamicImports(api),
        exit(api),
    ]);

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('classProperties', [
                'decorators',
                { decoratorsBeforeExport: true },
            ]);
        },
        visitor: {
            Program(path, state) {
                // The LWC babel plugin doesn't play well when associated along with other plugins. We first
                // run the LWC babel plugin and then run the rest of the transformation.
                // We ensure the ordering of the visitors by running all traversals from this Program node.

                // Program.enter; it needs to run here because path.traverse wont visit Program nodes.
                visitProgram(mergedVisitors, 'enter', path, state);

                // Traverse Program descendant nodes.
                path.traverse(mergedVisitors, state);

                // Program.exit; it needs to run here (instead of a Program.exit) to ensure other plugins don't modify the ast.
                visitProgram(mergedVisitors, 'exit', path, state);
            },
        },
    };
};
