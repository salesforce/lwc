/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const component = require('./component');
const {
    decorators,
    removeImportedDecoratorSpecifiers,
    validateImportedLwcDecoratorUsage,
} = require('./decorators');
const dedupeImports = require('./dedupe-imports');
const dynamicImports = require('./dynamic-imports');
const scopeCssImports = require('./scope-css-imports');
const compilerVersionNumber = require('./compiler-version-number');
const { getEngineImportSpecifiers } = require('./utils');

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    const { ExportDefaultDeclaration: transformCreateRegisterComponent } = component(api);
    const { Class: transformDecorators } = decorators(api);
    const { Import: transformDynamicImports } = dynamicImports(api);
    const { ClassBody: addCompilerVersionNumber } = compilerVersionNumber(api);

    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('classProperties', [
                'decorators',
                { decoratorsBeforeExport: true },
            ]);
        },

        visitor: {
            // The LWC babel plugin is incompatible with other plugins. To get around this, we run the LWC babel plugin
            // first by running all its traversals from this Program visitor.
            Program: {
                enter(path) {
                    const engineImportSpecifiers = getEngineImportSpecifiers(path);

                    // Validate the usage of LWC decorators.
                    validateImportedLwcDecoratorUsage(engineImportSpecifiers);

                    // Add ?scoped=true to *.scoped.css imports
                    scopeCssImports(api, path);
                },
                exit(path) {
                    const engineImportSpecifiers = getEngineImportSpecifiers(path);
                    removeImportedDecoratorSpecifiers(engineImportSpecifiers);

                    // Will eventually be removed to eliminate unnecessary complexity. Rollup already does this for us.
                    dedupeImports(api)(path);
                },
            },

            Import(path, state) {
                transformDynamicImports(path, state);
            },

            Class(path) {
                transformDecorators(path);
            },

            ClassBody(path) {
                addCompilerVersionNumber(path);
            },

            ExportDefaultDeclaration(path, state) {
                transformCreateRegisterComponent(path, state);
            },
        },
    };
};
