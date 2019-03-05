/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { rollup } from 'rollup';

import { MetadataCollector, BundleMetadata } from './meta-collector';
import rollupModuleResolver from '../rollup-plugins/module-resolver';

import rollupEnvReplacement from '../rollup-plugins/env-replacement';
import rollupTransform from '../rollup-plugins/transform';
import rollupCompat from '../rollup-plugins/compat';
import rollupMinify from '../rollup-plugins/minify';

import { NormalizedCompilerOptions, validateNormalizedOptions } from '../compiler/options';

import { SourceMap } from '../compiler/compiler';
import {
    CompilerError,
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    DiagnosticLevel,
    ModuleResolutionErrors,
    normalizeToDiagnostic,
} from '@lwc/errors';

export interface BundleReport {
    code: string;
    diagnostics: CompilerDiagnostic[];
    map: SourceMap | null;
    metadata: BundleMetadata;
}

interface RollupWarning {
    message: string;
    frame?: string;
    loc?: {
        file: string;
        line: number;
        column: number;
    };
    pos?: number;
}

const DEFAULT_FORMAT = 'amd';

function handleRollupWarning(diagnostics: CompilerDiagnostic[]) {
    return function onwarn({ message, loc, pos }: RollupWarning) {
        // loc and pos are bundled together
        const origin =
            loc && pos
                ? {
                      filename: loc.file,
                      location: {
                          line: loc.line,
                          column: loc.column,
                          start: pos,
                          length: 0,
                      },
                  }
                : {};

        diagnostics.push(
            generateCompilerDiagnostic(ModuleResolutionErrors.MODULE_RESOLUTION_ERROR, {
                messageArgs: [message],
                origin,
            })
        );
    };
}

export async function bundle(options: NormalizedCompilerOptions): Promise<BundleReport> {
    validateNormalizedOptions(options);

    const { outputConfig, name, namespace } = options;

    // TODO: remove format option once tests are converted to 'amd' format
    const format = (outputConfig as any).format || DEFAULT_FORMAT;

    const diagnostics: CompilerDiagnostic[] = [];
    const metadataCollector = new MetadataCollector();

    const plugins: any[] = [
        rollupModuleResolver({
            options,
        }),
    ];

    // Run environment variable replacement first. This ensures that the source code is still untouched
    // at this point.
    if (Object.keys(outputConfig.env).length) {
        plugins.push(
            rollupEnvReplacement({
                options,
            })
        );
    }

    plugins.push(
        rollupTransform({
            metadataCollector,
            options,
        })
    );

    if (outputConfig.compat) {
        plugins.push(rollupCompat(outputConfig));
    }

    if (outputConfig.minify) {
        plugins.push(rollupMinify(outputConfig));
    }

    let code;
    let map = null;
    try {
        const rollupBundler = await rollup({
            input: name,
            plugins,
            onwarn: handleRollupWarning(diagnostics),
        });

        const result = await rollupBundler.generate({
            amd: { id: namespace + '/' + name },
            interop: false,
            strict: false,
            sourcemap: outputConfig.sourcemap,
            format,
        });
        code = result.code;
        map = result.map;
    } catch (e) {
        // Rollup may have clobbered error.code with its own data
        if (e instanceof CompilerError && (e as any).pluginCode) {
            e.code = (e as any).pluginCode;
        }

        const diagnostic = normalizeToDiagnostic(ModuleResolutionErrors.MODULE_RESOLUTION_ERROR, e);
        diagnostic.level = DiagnosticLevel.Fatal;
        diagnostics.push(diagnostic);
    }

    return {
        diagnostics,
        code,
        map,
        metadata: metadataCollector.getMetadata(),
    };
}
