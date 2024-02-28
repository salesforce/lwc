/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as styleCompiler from '@lwc/style-compiler';
import { normalizeToCompilerError, TransformerErrors } from '@lwc/errors';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';

/**
 * Transform the passed source code
 * @param src The source to be transformed. Can be the content of a JavaScript, HTML, or CSS file.
 * @param filename The source filename, with extension.
 * @param config The transformation options. The `name` and the `namespace` of the component is the
 * minimum required for transformation.
 * @returns An object with the generated code, source map and gathered metadata.
 * @throws Compilation errors
 */
export default function styleTransform(
    src: string,
    filename: string,
    config: NormalizedTransformOptions
): TransformResult {
    const { customProperties } = config.stylesheetConfig;

    const styleCompilerConfig = {
        customProperties: {
            resolverModule:
                customProperties.resolution.type === 'module'
                    ? customProperties.resolution.name
                    : undefined,
        },
        scoped: config.scopedStyles,
        disableSyntheticShadowSupport: config.disableSyntheticShadowSupport,
        apiVersion: config.apiVersion,
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
