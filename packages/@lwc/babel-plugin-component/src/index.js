/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const component = require('./component');
const { decorators } = require('./decorators');
const { exit } = require('./program');
const dynamicImports = require('./dynamic-imports');

// The @lwc/babel-plugin-component should always run before any other transform. It requires the
// decorators and the class fields to be intact in order to operate.
module.exports = function LwcClassTransform(api) {
    const { merge: mergeVisitors } = api.traverse.visitors;
    const visitor = mergeVisitors([
        decorators(api),
        component(api),
        dynamicImports(api),
        exit(api),
    ]);

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push(['decorators', { decoratorsBeforeExport: true }]);
            parserOpts.plugins.push('classProperties');
        },
        visitor: {
            Program: {
                enter(path, state) {
                    const innerState = { ...state };

                    for (const programEnter of visitor.Program.enter) {
                        programEnter(path, innerState);
                    }

                    path.traverse(visitor, innerState);

                    for (const programExit of visitor.Program.exit) {
                        programExit(path, innerState);
                    }
                },
            },
        },
    };
};
