/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';

import babelClassPropertiesPlugin from '@babel/plugin-proposal-class-properties';
import babelObjectRestSpreadPlugin from '@babel/plugin-proposal-object-rest-spread';
import lwcClassTransformPlugin from '@lwc/babel-plugin-component';

import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';

export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const {
        isExplicitImport,
        experimentalDynamicComponent: dynamicImports,
        outputConfig: { sourcemap },
    } = options;

    let result;
    try {
        // The LWC babel plugin doesn't play well when associated along with other plugins. We first
        // run the LWC babel plugin and then run the rest of the transformation on the intermediary
        // code.
        const intermediary = babel.transformSync(code, {
            babelrc: false,
            configFile: false,
            plugins: [[lwcClassTransformPlugin, { isExplicitImport, dynamicImports }]],
            filename,
            sourceMaps: sourcemap,
        })!;

        result = babel.transformSync(intermediary.code!, {
            babelrc: false,
            configFile: false,
            plugins: [
                [babelClassPropertiesPlugin, { loose: true }],

                // This plugin should be removed in a future version. The object-rest-spread is
                // already a stage 4 feature. The LWC compile should leave this syntax untouched.
                babelObjectRestSpreadPlugin,
            ],
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
