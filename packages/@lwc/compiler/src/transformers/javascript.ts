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
        result = babel.transformSync(code, {
            filename,
            sourceMaps: sourcemap,

            // Prevent Babel from loading local configuration.
            babelrc: false,
            configFile: false,

            // Force Babel to generate new line and whitespaces. This prevent Babel from generating
            // an error when the generated code is over 500KB.
            compact: false,

            plugins: [
                [lwcClassTransformPlugin, { isExplicitImport, dynamicImports }],
                [babelClassPropertiesPlugin, { loose: true }],

                // This plugin should be removed in a future version. The object-rest-spread is
                // already a stage 4 feature. The LWC compile should leave this syntax untouched.
                babelObjectRestSpreadPlugin,
            ],
        })!;
    } catch (e) {
        let transformerError = TransformerErrors.JS_TRANSFORMER_ERROR;

        // Sniff for a Babel decorator error, so we can provide a more helpful error message.
        if (
            (e as any).code === 'BABEL_TRANSFORM_ERROR' &&
            (e as any).message?.includes('Decorators are not enabled.')
        ) {
            transformerError = TransformerErrors.JS_TRANSFORMER_DECORATOR_ERROR;
        }
        throw normalizeToCompilerError(transformerError, e, { filename });
    }

    return {
        code: result.code!,
        map: result.map,
    };
}
