/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const moduleImports = require('@babel/helper-module-imports');
const { LWCClassErrors } = require('@lwc/errors');

const { generateError } = require('./utils');

function getImportSource(path) {
    return path.parentPath.get('arguments.0');
}

function validateImport(sourcePath) {
    if (!sourcePath.isStringLiteral()) {
        throw generateError(sourcePath, {
            errorInfo: LWCClassErrors.INVALID_DYNAMIC_IMPORT_SOURCE_STRICT,
            messageArgs: [String(sourcePath)],
        });
    }
}
/*
 * Expected API for this plugin:
 * { dynamicImports: { loader: string, strictSpecifier: boolean } }
 */
module.exports = function () {
    function getLoaderRef(path, loaderName, state) {
        if (!state.loaderRef) {
            state.loaderRef = moduleImports.addNamed(path, 'load', loaderName);
        }
        return state.loaderRef;
    }

    function addDynamicImportDependency(dependency, state) {
        if (!state.dynamicImports) {
            state.dynamicImports = [];
        }

        if (!state.dynamicImports.includes(dependency)) {
            state.dynamicImports.push(dependency);
        }
    }

    return {
        Import(path, state) {
            const { dynamicImports } = state.opts;
            if (!dynamicImports) {
                return;
            }

            const { loader, strictSpecifier } = dynamicImports;
            const sourcePath = getImportSource(path);

            if (strictSpecifier) {
                validateImport(sourcePath);
            }

            if (loader) {
                const loaderId = getLoaderRef(path, loader, state);
                path.replaceWith(loaderId);
            }

            if (sourcePath.isStringLiteral()) {
                addDynamicImportDependency(sourcePath.node.value, state);
            }
        },
    };
};
