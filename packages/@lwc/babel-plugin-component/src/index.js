/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { LWCClassErrors } = require('@lwc/errors');

const component = require('./component');
const { LWC_SUPPORTED_APIS } = require('./constants');
const {
    decorators,
    isLwcDecoratorName,
    removeImportSpecifiers,
    validateLwcDecorators,
} = require('./decorators');
const dedupeImports = require('./dedupe-imports');
const dynamicImports = require('./dynamic-imports');
const { generateError, getEngineImportSpecifiers } = require('./utils');

/**
 * The transform is done in 2 passes:
 *    - First, apply in a single AST traversal the decorators and the component transformation.
 *    - Then, in a second path transform class properties using the official babel plugin "babel-plugin-transform-class-properties".
 */
module.exports = function LwcClassTransform(api) {
    return {
        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push('classProperties', [
                'decorators',
                { decoratorsBeforeExport: true },
            ]);
        },
        visitor: {
            ...decorators(api),
            ...component(api),
            ...dynamicImports(api),

            // The LWC babel plugin is incompatible with other plugins. To get around this, we run the LWC babel plugin
            // first by running all its traversals from this Program visitor.
            Program: {
                enter(path) {
                    const engineImportSpecifiers = getEngineImportSpecifiers(path);

                    // Validate what is imported from 'lwc'. This validation will eventually be moved out from the compiler
                    // and into a lint rule.
                    engineImportSpecifiers.forEach(({ name }) => {
                        if (!LWC_SUPPORTED_APIS.has(name)) {
                            throw generateError(path, {
                                errorInfo: LWCClassErrors.INVALID_IMPORT_PROHIBITED_API,
                                messageArgs: [name],
                            });
                        }
                    });

                    // Validate the usage of LWC decorators.
                    const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) =>
                        isLwcDecoratorName(name)
                    );
                    validateLwcDecorators(decoratorImportSpecifiers);
                },
                exit(path) {
                    const engineImportSpecifiers = getEngineImportSpecifiers(path);
                    const decoratorImportSpecifiers = engineImportSpecifiers.filter(({ name }) =>
                        isLwcDecoratorName(name)
                    );
                    removeImportSpecifiers(decoratorImportSpecifiers);

                    // Will eventually be removed to eliminate unnecessary complexity. Rollup already does this for us.
                    dedupeImports(api)(path);
                },
            },
        },
    };
};
