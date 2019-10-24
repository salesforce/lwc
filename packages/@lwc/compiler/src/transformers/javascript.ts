/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import lwcClassTransformPlugin from '@lwc/babel-plugin-component';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { BABEL_CONFIG_BASE, BABEL_PLUGINS_BASE } from '../babel-plugins';
import { NormalizedTransformOptions } from '../compiler/options';
import { FileTransformerResult } from './transformer';

export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): FileTransformerResult {
    const { isExplicitImport, experimentalDynamicComponent: dynamicImports } = options;
    const config = Object.assign({}, BABEL_CONFIG_BASE, {
        plugins: [
            [lwcClassTransformPlugin, { isExplicitImport, dynamicImports }],
            ...BABEL_PLUGINS_BASE,
        ],
        filename,
        sourceMaps: options.outputConfig.sourcemap,
    });

    let result;
    try {
        result = babel.transform(code, config);
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.JS_TRANSFORMER_ERROR, e, { filename });
    }

    return {
        code: result.code,
        map: result.map,
    };
}
