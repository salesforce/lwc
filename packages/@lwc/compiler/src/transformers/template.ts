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
import { TemplateModuleDependency } from '@lwc/template-compiler';

import { MetadataCollector } from '../bundler/meta-collector';
import { NormalizedCompilerOptions } from '../compiler/options';

// TODO: once we come up with a strategy to export all types from the module,
// below interface should be removed and resolved from template-compiler module.
export interface TemplateMetadata {
    templateUsedIds: string[];
    definedSlots: string[];
    templateDependencies: TemplateModuleDependency[];
}

/**
 * Transforms a HTML template into module exporting a template function.
 * The transform also add a style import for the default stylesheet associated with
 * the template regardless if there is an actual style or not.
 */
export default function templateTransform(
    src: string,
    filename: string,
    options: NormalizedCompilerOptions,
    metadataCollector?: MetadataCollector
) {
    let result;
    let metadata;

    try {
        result = compile(src, {});
        const fatalError = result.warnings.find(warning => warning.level === DiagnosticLevel.Error);
        if (fatalError) {
            throw CompilerError.from(fatalError, { filename });
        }

        metadata = result.metadata;
        if (metadataCollector) {
            metadataCollector.collectExperimentalTemplateDependencies(
                filename,
                metadata.templateDependencies
            );
        }
    } catch (e) {
        throw normalizeToCompilerError(TransformerErrors.HTML_TRANSFORMER_ERROR, e, { filename });
    }

    const { code } = result;

    // Rollup only cares about the mappings property on the map. Since producing a source map for
    // the template doesn't make sense, the transform returns an empty mappings.
    return {
        code: serialize(code, filename, options),
        map: { mappings: '' },
        metadata,
    };
}

function serialize(
    code: string,
    filename: string,
    { namespace, name }: NormalizedCompilerOptions
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
