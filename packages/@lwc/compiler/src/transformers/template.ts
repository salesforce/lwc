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
    normalizeToCompilerError,
    DiagnosticLevel,
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
        enableDynamicComponents,
        experimentalDynamicDirective: deprecatedDynamicDirective,
        instrumentation,
        namespace,
        name,
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

    // TODO [#3733]: remove support for legacy scope tokens
    const { scopeToken, legacyScopeToken } = generateScopeTokens(filename, namespace, name);

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: serialize(result.code, filename, scopeToken, legacyScopeToken, apiVersion),
        map: { mappings: '' },
        warnings,
        cssScopeTokens: [
            scopeToken,
            `${scopeToken}-host`, // implicit scope token created by `makeHostToken()` in `@lwc/engine-core`
            // The legacy tokens must be returned as well since we technically don't know what we're going to render
            // This is not strictly required since this is only used for Jest serialization (as of this writing),
            // and people are unlikely to set runtime flags in Jest, but it is technically correct to include this.
            legacyScopeToken,
            `${legacyScopeToken}-host`,
        ],
    };
}

// The reason this hash code implementation [1] is chosen is because:
// 1. It has a very low hash collision rate - testing a list of 466,551 English words [2], it generates no collisions
// 2. It is fast - it can hash those 466k words in 70ms (Node 16, 2020 MacBook Pro)
// 3. The output size is reasonable (32-bit - this can be base-32 encoded at 10-11 characters)
//
// Also note that the reason we're hashing rather than generating a random number is because
// we want the output to be predictable given the input, which helps with caching.
//
// [1]: https://stackoverflow.com/a/52171480
// [2]: https://github.com/dwyl/english-words/blob/a77cb15f4f5beb59c15b945f2415328a6b33c3b0/words.txt
function generateHashCode(str: string) {
    const seed = 0;
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function escapeScopeToken(input: string) {
    // Minimal escape for strings containing the "@" and "#" characters, which are disallowed
    // in certain cases in attribute names
    return input.replace(/@/g, '___at___').replace(/#/g, '___hash___');
}

function generateScopeTokens(
    filename: string,
    namespace: string | undefined,
    name: string | undefined
) {
    const uniqueToken = `${namespace}-${name}_${path.basename(filename, path.extname(filename))}`;

    // This scope token is all lowercase so that it works correctly in case-sensitive namespaces (e.g. SVG).
    // It is deliberately designed to discourage people from relying on it by appearing somewhat random.
    // (But not totally random, because it's nice to have stable scope tokens for our own tests.)
    // Base-32 is chosen because it is not case-sensitive (0-v), and generates short strings with the given hash
    // code implementation (10-11 characters).
    const hashCode = generateHashCode(uniqueToken);
    const scopeToken = `lwc-${hashCode.toString(32)}`;

    // This scope token is based on the namespace and name, and contains a mix of uppercase/lowercase chars
    const legacyScopeToken = escapeScopeToken(uniqueToken);

    return {
        scopeToken,
        legacyScopeToken,
    };
}

function serialize(
    code: string,
    filename: string,
    scopeToken: string,
    legacyScopeToken: string,
    apiVersion: APIVersion
): string {
    const cssRelPath = `./${path.basename(filename, path.extname(filename))}.css`;
    const scopedCssRelPath = `./${path.basename(filename, path.extname(filename))}.scoped.css`;

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

    if (isAPIFeatureEnabled(APIFeature.LOWERCASE_SCOPE_TOKENS, apiVersion)) {
        // Include both the new and legacy tokens, so that the runtime can decide based on a flag whether
        // we need to render the legacy one. This is designed for cases where the legacy one is required
        // for backwards compat (e.g. global stylesheets that rely on the legacy format for a CSS selector).
        buffer += `tmpl.stylesheetToken = "${scopeToken}";\n`;
        buffer += `tmpl.legacyStylesheetToken = "${legacyScopeToken}";\n`;
    } else {
        // In old API versions, we can just keep doing what we always did
        buffer += `tmpl.stylesheetToken = "${legacyScopeToken}";\n`;
    }

    // Note that `renderMode` and `slots` are already rendered in @lwc/template-compiler and appear
    // as `code` above. At this point, no more expando props should be added to `tmpl`.
    buffer += 'freezeTemplate(tmpl);\n';

    return buffer;
}
