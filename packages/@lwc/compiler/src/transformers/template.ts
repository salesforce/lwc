/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';

import {
    CompilerError,
    normalizeToCompilerError,
    DiagnosticLevel,
    TransformerErrors,
} from '@lwc/errors';
import compile from '@lwc/template-compiler';

import { NormalizedTransformOptions } from '../options';
import { TransformResult } from './transformer';

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
export default function templateTransform(
    src: string,
    filename: string,
    options: NormalizedTransformOptions
): TransformResult {
    let result;

    try {
        result = compile(src, {
            experimentalDynamicDirective: !!options.experimentalDynamicComponent,
            preserveHtmlComments: !!options.preserveHtmlComments,
        });
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    const fatalError = result.warnings.find((warning) => warning.level === DiagnosticLevel.Error);
    if (fatalError) {
        throw CompilerError.from(fatalError, { filename });
    }

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: serialize(result.code, filename, options),
        map: { mappings: '' },
    };
}

function serialize(
    code: string,
    filename: string,
    { namespace, name }: NormalizedTransformOptions
): string {
    const cssRelPath = `./${path.basename(filename, path.extname(filename))}.css`;
    const scopingAttribute = `${namespace}-${name}_${path.basename(
        filename,
        path.extname(filename)
    )}`;
    let buffer = '';
    buffer += `import _implicitStylesheets from "${cssRelPath}";\n\n`;
    buffer += code;
    buffer += '\n\n';
    buffer += 'if (_implicitStylesheets) {\n';
    buffer += `  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets)\n`;
    buffer += `}\n`;

    buffer += `tmpl.stylesheetTokens = {\n`;
    buffer += `  hostAttribute: "${scopingAttribute}-host",\n`;
    buffer += `  shadowAttribute: "${scopingAttribute}"\n`;
    buffer += `};\n`;

    return buffer;
}
