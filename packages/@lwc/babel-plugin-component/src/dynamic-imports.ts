/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { NodePath } from '@babel/traverse';
import { types, Visitor } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { LWCClassErrors } from '@lwc/errors';
import { generateError } from './utils';
import { LwcBabelPluginPass } from './types';

function getImportSource(path: NodePath<types.Import>): NodePath<types.Node> {
    return path.parentPath.get('arguments.0') as NodePath<types.Node>;
}

function validateImport(sourcePath: NodePath<types.Node>) {
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
export default function (): Visitor<LwcBabelPluginPass> {
    function getLoaderRef(
        path: NodePath<types.Import>,
        loaderName: string,
        state: LwcBabelPluginPass
    ): types.Identifier {
        if (!state.loaderRef) {
            state.loaderRef = addNamed(path, 'load', loaderName);
        }
        return state.loaderRef;
    }

    function addDynamicImportDependency(dependency: string, state: LwcBabelPluginPass) {
        if (!state.dynamicImports) {
            state.dynamicImports = [];
        }

        if (!state.dynamicImports.includes(dependency)) {
            state.dynamicImports!.push(dependency);
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
}
