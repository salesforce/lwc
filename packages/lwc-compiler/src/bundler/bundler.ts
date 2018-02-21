import {  Diagnostic, DiagnosticLevel } from '../diagnostics/diagnostic';

import { rollup } from 'rollup';
import * as rollupPluginReplace from 'rollup-plugin-replace';

import { isCompat, isProd } from '../modes';

import rollupModuleResolver from '../rollup-plugins/module-resolver';
import rollupTransfrom from '../rollup-plugins/transform';
import rollupCompat from '../rollup-plugins/compat';
import rollupMinify from '../rollup-plugins/minify';
import { CompilerOptions } from '../compiler';

// TODO: type
function rollupWarningOverride(warning: any) {
    if (warning.code && warning.code === 'UNRESOLVED_IMPORT') {
        return;
    }

    console.warn(warning.message);
}

// TODO: type
function mergeMetadata(metadata: any) {
    const dependencies = new Map((metadata.rollupDependencies || []).map((d: any) => ([d, 'module'])));
    const decorators = [];

    for (let i in metadata) {
        (metadata[i].templateDependencies || []).forEach((td: any) => (dependencies.set(td, 'component')));
        decorators.push(...(metadata[i].decorators || []));
    }

    return {
        decorators,
        references: Array.from(dependencies).map(d => ({name: d[0], type: d[1]}))
    };
}

// export interface BundleOptions {
//     $metadata: any,
//     env: any,
//     moduleResolver: any,
//     resolveProxyCompat: any,
//     mode: string,
//     format?: string,
//     globals?: any,
//     normalizedModuleName: string, // TODO: move normalization to bundle invoker
// }

export interface BundleReport {
    status?: string,
    code?: string,
    map?: any,
    metadata?: any,
    rawMetadata?: any,
    diagnostics?: Diagnostic[],
};

export function bundle(entry: string, options: CompilerOptions) {
    const environment = options.env.NODE_ENV || process.env.NODE_ENV;
    const { moduleResolver, $metadata, resolveProxyCompat } = options;
    const plugins = [
        rollupPluginReplace({ 'process.env.NODE_ENV': JSON.stringify(environment) }),
        rollupModuleResolver({ moduleResolver, $metadata }),
        rollupTransfrom(options)
    ];

    if (isCompat(options.mode)) { // compat
        plugins.push(rollupCompat({ resolveProxyCompat }));
    }

    if (isProd(options.mode)) {
        plugins.push(rollupMinify(options));
    }

    return rollup({
        input: entry,
        plugins: plugins,
        onwarn: rollupWarningOverride,
    }).then(
        (bundleFn: any) => {
            return bundleFn
                .generate({
                    amd: { id: options.normalizedModuleName },
                    interop: false,
                    strict: false,
                    format: options.format,
                    globals: options.globals
                })
                .then((result: BundleReport) => {
                    return {
                        code: result.code,
                        map: result.map,
                        metadata: mergeMetadata(options.$metadata),
                        rawMetadata: options.$metadata,
                        diagnostics: [],
                    };
                }, (error: any) => {
                    return handleFailure(error, entry);
                });
        }, (error: any) => {
            return handleFailure(error, entry);
        });
}

function handleFailure(error: any, filename: string): BundleReport {
    // TODO:  do we need location?
    const diagnostic = {
        level: DiagnosticLevel.Fatal,
        filename,
        message: error.message,
    };
    return { diagnostics: [ diagnostic ] };
}
