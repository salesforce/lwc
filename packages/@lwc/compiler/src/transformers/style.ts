/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createHash } from 'crypto';
import * as styleCompiler from '@lwc/style-compiler';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';

import type { Config } from '@lwc/style-compiler';

export default function styleTransform(
    src: string,
    filename: string,
    config: NormalizedTransformOptions
): TransformResult {
    const { customProperties } = config.stylesheetConfig;

    const styleCompilerConfig: Config = {
        customProperties: {
            resolverModule:
                customProperties.resolution.type === 'module'
                    ? customProperties.resolution.name
                    : undefined,
        },
        scoped: config.scopedStyles,
        disableSyntheticShadowSupport: config.disableSyntheticShadowSupport,
        apiVersion: config.apiVersion,
        hmrModuleContext: config.enableHmr
            ? {
                  hash: createHash('md5').update(src, 'utf8').digest('hex'),
                  path: filename,
              }
            : undefined,
    };

    let res;
    try {
        res = styleCompiler.transform(src, filename, styleCompilerConfig);
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.CSS_TRANSFORMER_ERROR, e, { filename });
    }

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the styles doesn't make sense, the transform returns an empty mappings.
    return {
        code: res.code,
        map: { mappings: '' },
    };
}
