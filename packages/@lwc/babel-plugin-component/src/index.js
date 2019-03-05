/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const component = require('./component');
const { decorators } = require('./decorators');
const { exit } = require('./program');
/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    const { merge: mergeVisitors } = api.traverse.visitors;

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push(['decorators', { decoratorsBeforeExport: true }]);
            parserOpts.plugins.push('classProperties');
            parserOpts.plugins.push('dynamicImport');
        },
        visitor: mergeVisitors([decorators(api), component(api), exit(api)]),
    };
};
