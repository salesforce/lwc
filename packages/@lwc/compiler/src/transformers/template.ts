/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as path from 'path';
import { APIFeature, APIVersion, isAPIFeatureEnabled } from '@lwc/shared';
import {
    CompilerError,
    DiagnosticLevel,
    normalizeToCompilerError,
    TransformerErrors,
} from '@lwc/errors';
import { compile } from '@lwc/template-compiler';

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
    const {
        experimentalDynamicComponent,
        // TODO [#3370]: remove experimental template expression flag
        experimentalComplexExpressions,
        preserveHtmlComments,
        enableStaticContentOptimization,
        customRendererConfig,
        enableLwcSpread,
        enableDynamicComponents,
        experimentalDynamicDirective: deprecatedDynamicDirective,
        instrumentation,
        apiVersion,
    } = options;
    const experimentalDynamicDirective =
        deprecatedDynamicDirective ?? Boolean(experimentalDynamicComponent);

    let result;
    try {
        result = compile(src, {
            experimentalDynamicDirective,
            // TODO [#3370]: remove experimental template expression flag
            experimentalComplexExpressions,
            preserveHtmlComments,
            enableStaticContentOptimization,
            customRendererConfig,
            enableLwcSpread,
            enableDynamicComponents,
            instrumentation,
            apiVersion,
        });
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    const fatalError = result.warnings.find((warning) => warning.level === DiagnosticLevel.Error);
    if (fatalError) {
        throw CompilerError.from(fatalError, { filename });
    }

    // The "Error" diagnostic level makes no sense to include here, because it would already have been
    // thrown above. As for "Log" and "Fatal", they are currently unused.
    const warnings = result.warnings.filter((_) => _.level === DiagnosticLevel.Warning);

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: serialize(result.code, filename, options),
        map: { mappings: '' },
        warnings,
    };
}

function escapeScopeToken(input: string) {
    // Minimal escape for strings containing the "@" and "#" characters, which are disallowed
    // in certain cases in attribute names
    return input.replace(/@/g, '___at___').replace(/#/g, '___hash___');
}

// Via https://stackoverflow.com/a/7616484
function generateHashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function generateScopeToken(
    filename: string,
    namespace: string | undefined,
    name: string | undefined,
    apiVersion: APIVersion
) {
    const uniqueToken = `${namespace}-${name}_${path.basename(filename, path.extname(filename))}`;

    if (isAPIFeatureEnabled(APIFeature.LOWERCASE_SCOPE_TOKENS, apiVersion)) {
        // Hash the string, the reversed string, and the string again for good measure. We want to avoid hash collisions
        const stringToHash = uniqueToken + [...uniqueToken].reverse().join('') + uniqueToken;
        const hash = generateHashCode(stringToHash);

        // This scope token is all lowercase, and is deliberately designed to discourage people from relying on it
        // by appearing somewhat random. (But not totally random, because that would break snapshot tests constantly.)
        return `lwc-${hash.toString(16)}`;
    } else {
        // This scope token is based on the namespace and name, and contains a mix of uppercase/lowercase chars
        return escapeScopeToken(uniqueToken);
    }
}

function serialize(
    code: string,
    filename: string,
    { namespace, name, apiVersion }: NormalizedTransformOptions
): string {
    const cssRelPath = `./${path.basename(filename, path.extname(filename))}.css`;
    const scopedCssRelPath = `./${path.basename(filename, path.extname(filename))}.scoped.css`;
    const scopeToken = generateScopeToken(filename, namespace, name, apiVersion);
    let buffer = '';
    buffer += `import { freezeTemplate } from "lwc";\n\n`;
    buffer += `import _implicitStylesheets from "${cssRelPath}";\n\n`;
    buffer += `import _implicitScopedStylesheets from "${scopedCssRelPath}?scoped=true";\n\n`;
    buffer += code;
    buffer += '\n\n';
    buffer += 'if (_implicitStylesheets) {\n';
    buffer += `  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);\n`;
    buffer += `}\n`;
    buffer += 'if (_implicitScopedStylesheets) {\n';
    buffer += `  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);\n`;
    buffer += `}\n`;
    buffer += `tmpl.stylesheetToken = "${scopeToken}";\n`;
    // Note that `renderMode` and `slots` are already rendered in @lwc/template-compiler and appear
    // as `code` above. At this point, no more expando props should be added to `tmpl`.
    buffer += 'freezeTemplate(tmpl);\n';

    return buffer;
}
