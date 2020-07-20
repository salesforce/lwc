/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { rollup, Plugin, RollupWarning } from 'rollup';
import {
    LWCDiagnostic,
    captureDiagnostic,
    ModuleResolutionErrors,
    normlizeToLWCDiagnostic,
    DiagnosticSeverity,
    Diagnostic,
} from '@lwc/errors';

import rollupModuleResolver from '../rollup-plugins/module-resolver';

import rollupEnvReplacement from '../rollup-plugins/env-replacement';
import rollupTransform from '../rollup-plugins/transform';
import rollupCompat from '../rollup-plugins/compat';
import rollupMinify from '../rollup-plugins/minify';

import { NormalizedCompileOptions, validateNormalizedCompileOptions } from '../options';

import { SourceMap } from '../compiler/compiler';

export interface BundleReport {
    code: string;
    diagnostics: LWCDiagnostic[];
    map: SourceMap | null;
}

const DEFAULT_FORMAT = 'amd';

function handleRollupWarning(diagnostics: LWCDiagnostic[]) {
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
            captureDiagnostic(ModuleResolutionErrors.MODULE_RESOLUTION_ERROR(message), origin)
        );
    };
}

export async function bundle(options: NormalizedCompileOptions): Promise<BundleReport> {
    validateNormalizedCompileOptions(options);

    const { outputConfig, name, namespace } = options;

    // TODO [#1268]: remove format option once tests are converted to 'amd' format
    const format = (outputConfig as any).format || DEFAULT_FORMAT;

    const lwcDiagnostics: LWCDiagnostic[] = [];

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
            onwarn: handleRollupWarning(lwcDiagnostics),
        });

        const { output } = await rollupBundler.generate({
            amd: { id: namespace + '/' + name },
            strict: false,
            sourcemap: outputConfig.sourcemap,
            format,
        });

        // Rollup produces multiple chunks when a module uses "import()" with a relative import
        // path. We need to ensure the compiled module only contains the main chunk.
        if (output.length > 1) {
            lwcDiagnostics.push(
                captureDiagnostic(ModuleResolutionErrors.RELATIVE_DYNAMIC_IMPORT())
            );
        }

        const result = output[0];
        code = result.code;
        map = result.map;
    } catch (e) {
        // Rollup may have clobbered error.code with its own data
        if (e instanceof Diagnostic && (e as any).pluginCode) {
            e.code = (e as any).pluginCode;
        }

        const diagnostic = normlizeToLWCDiagnostic(
            ModuleResolutionErrors.MODULE_RESOLUTION_ERROR(e.message),
            e
        );
        diagnostic.severity = DiagnosticSeverity.Fatal;
        lwcDiagnostics.push(diagnostic);
    }

    return {
        diagnostics: lwcDiagnostics,
        code,
        map,
    };
}
