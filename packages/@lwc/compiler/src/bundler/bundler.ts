/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { rollup, Plugin, RollupWarning } from 'rollup';
import {
    CompilerError,
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    DiagnosticLevel,
    ModuleResolutionErrors,
    normalizeToDiagnostic,
} from '@lwc/errors';

import { MetadataCollector, BundleMetadata } from './meta-collector';
import rollupModuleResolver from '../rollup-plugins/module-resolver';

import rollupEnvReplacement from '../rollup-plugins/env-replacement';
import rollupTransform from '../rollup-plugins/transform';
import rollupCompat from '../rollup-plugins/compat';
import rollupMinify from '../rollup-plugins/minify';

import { NormalizedCompilerOptions, validateNormalizedOptions } from '../compiler/options';

import { SourceMap } from '../compiler/compiler';

export interface BundleReport {
    code: string;
    diagnostics: CompilerDiagnostic[];
    map: SourceMap | null;
    metadata: BundleMetadata;
}

const DEFAULT_FORMAT = 'amd';

function handleRollupWarning(diagnostics: CompilerDiagnostic[]) {
    return function onwarn(warning: string | RollupWarning) {
        let message;
        let origin = {};

        if (typeof warning === 'string') {
            message = warning;
        } else {
            message = warning.message;

            if (warning.loc) {
                const { loc, pos } = warning;
                origin = {
                    filename: loc.file,
                    location: {
                        line: loc.line,
                        column: loc.column,
                        start: pos,
                        length: 0,
                    },
                };
            }
        }

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

    const plugins: Plugin[] = [
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

    let code: string = '';
    let map: SourceMap | null = null;

    try {
        const rollupBundler = await rollup({
            input: name,
            plugins,
            onwarn: handleRollupWarning(diagnostics),
        });

        const { output } = await rollupBundler.generate({
            amd: { id: namespace + '/' + name },
            interop: false,
            strict: false,
            sourcemap: outputConfig.sourcemap,
            format,
        });

        if (output.length > 1) {
            throw new Error('TODO');
        }

        code = output[0].code;
        map = output[0].map;
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
