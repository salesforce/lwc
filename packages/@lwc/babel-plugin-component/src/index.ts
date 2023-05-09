/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import component from './component';
import {
    decorators,
    removeImportedDecoratorSpecifiers,
    validateImportedLwcDecoratorUsage,
} from './decorators';

import dedupeImports from './dedupe-imports';
import dynamicImports from './dynamic-imports';
import scopeCssImports from './scope-css-imports';
import compilerVersionNumber from './compiler-version-number';
import { getEngineImportSpecifiers } from './utils';
import { BabelAPI, LwcBabelPluginPass } from './types';
import type { PluginObj } from '@babel/core';

// This is useful for consumers of this package to define their options
export type { LwcBabelPluginOptions } from './types';

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
export default function LwcClassTransform(api: BabelAPI): PluginObj<LwcBabelPluginPass> {
    const { ExportDefaultDeclaration: transformCreateRegisterComponent } = component(api);
    const { Class: transformDecorators } = decorators(api);
    const { Import: transformDynamicImports } = dynamicImports();
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
                enter(path, state) {
                    const engineImportSpecifiers = getEngineImportSpecifiers(path);

                    // Validate the usage of LWC decorators.
                    validateImportedLwcDecoratorUsage(engineImportSpecifiers, state);

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

            Import: transformDynamicImports,

            Class: transformDecorators,

            ClassBody: addCompilerVersionNumber,

            ExportDefaultDeclaration: transformCreateRegisterComponent,
        },
    };
}
