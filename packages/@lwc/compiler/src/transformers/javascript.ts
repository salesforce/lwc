/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as babel from '@babel/core';
import { isAPIFeatureEnabled, APIFeature } from '@lwc/shared';
import babelClassPropertiesPlugin from '@babel/plugin-proposal-class-properties';
import babelObjectRestSpreadPlugin from '@babel/plugin-proposal-object-rest-spread';
import lwcClassTransformPlugin from '@lwc/babel-plugin-component';
import lockerBabelPluginTransformUnforgeables from '@locker/babel-plugin-transform-unforgeables';
import babelAsyncToGenPlugin from '@babel/plugin-transform-async-to-generator';
import babelAsyncGeneratorFunctionsPlugin from '@babel/plugin-proposal-async-generator-functions';

import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';
import type { LwcBabelPluginOptions } from '@lwc/babel-plugin-component';

export default function scriptTransform(
    code: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    const {
        isExplicitImport,
        experimentalDynamicComponent: dynamicImports,
        outputConfig: { sourcemap },
        enableLightningWebSecurityTransforms,
        namespace,
        name,
        instrumentation,
        apiVersion,
    } = options;

    const lwcBabelPluginOptions: LwcBabelPluginOptions = {
        isExplicitImport,
        dynamicImports,
        namespace,
        name,
        instrumentation,
        apiVersion,
    };

    const plugins: babel.PluginItem[] = [
        [lwcClassTransformPlugin, lwcBabelPluginOptions],
        [babelClassPropertiesPlugin, { loose: true }],
    ];

    if (!isAPIFeatureEnabled(APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION, apiVersion)) {
        plugins.push(babelObjectRestSpreadPlugin);
    }

    if (enableLightningWebSecurityTransforms) {
        plugins.push(
            lockerBabelPluginTransformUnforgeables,
            babelAsyncToGenPlugin,
            babelAsyncGeneratorFunctionsPlugin
        );
    }

    let result;
    try {
        result = babel.transformSync(code, {
            filename,
            sourceMaps: sourcemap,

            // Prevent Babel from loading local configuration.
            babelrc: false,
            configFile: false,

            // Force Babel to generate new line and white spaces. This prevent Babel from generating
            // an error when the generated code is over 500KB.
            compact: false,
            plugins,
        })!;
    } catch (e) {
        let transformerError = TransformerErrors.JS_TRANSFORMER_ERROR;

        // Sniff for a Babel decorator error, so we can provide a more helpful error message.
        if (
            (e as any).code === 'BABEL_TRANSFORM_ERROR' &&
            (e as any).message?.includes('Decorators are not enabled.') &&
            /\b(track|api|wire)\b/.test((e as any).message) // sniff for @track/@api/@wire
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
