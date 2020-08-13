/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { BABEL_CONFIG_BASE } from '../babel-plugins';
import { NormalizedTransformOptions } from '../options';
import { FileTransformerResult } from './transformer';

const BABEL_PLUGINS_STAGE_4 = [
    '@babel/plugin-proposal-async-generator-functions',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-numeric-separator',
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
];

export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): FileTransformerResult {
    const {
        isExplicitImport,
        experimentalDynamicComponent,
        outputConfig: { sourcemap },
    } = options;

    let result: babel.BabelFileResult;
    try {
        // The LWC babel plugin doesn't play well when associated along with other plugins. We first
        // run the LWC babel plugin and then run the rest of the transformation on the intermediary
        // code.
        const intermediary = babel.transformSync(code, {
            ...BABEL_CONFIG_BASE,
            plugins: [
                [
                    '@lwc/babel-plugin-component',
                    { isExplicitImport, dynamicImports: experimentalDynamicComponent },
                ],
            ],
            filename,
            sourceMaps: sourcemap,
        })!;

        result = babel.transformSync(intermediary.code!, {
            ...BABEL_CONFIG_BASE,
            plugins: BABEL_PLUGINS_STAGE_4,
            filename,
            sourceMaps: sourcemap,
            inputSourceMap: intermediary.map ?? undefined,
        })!;
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.JS_TRANSFORMER_ERROR, e, { filename });
    }

    return {
        code: result.code!,
        map: result.map,
    };
}
