import {  Diagnostic, DiagnosticLevel } from '../diagnostics/diagnostic';

import { rollup } from 'rollup';
import * as rollupPluginReplace from 'rollup-plugin-replace';

import { isCompat, isProd } from '../modes';

import { inMemoryModuleResolver } from '../module-resolvers/in-memory';
import rollupModuleResolver from '../rollup-plugins/module-resolver';
import rollupTransfrom from '../rollup-plugins/transform';
import rollupCompat from '../rollup-plugins/compat';
import rollupMinify from '../rollup-plugins/minify';
import { CompilerOptions } from '../compiler';

const DEFAULT_FORMAT = 'amd';
const resolveProxyCompat = {
    independent: 'proxy-compat',
};

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

    console.log("META >>>> ", metadata);
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
    const { outputConfig } = options;
    const env = outputConfig && outputConfig.env;
    const format = (outputConfig && outputConfig.format) || DEFAULT_FORMAT;
    const environment = env && env.NODE_ENV || process.env.NODE_ENV;
    //const $metadata:any  = {};\
    const $metadata = {};//options.$metadata;
    const plugins = [
        rollupPluginReplace({ 'process.env.NODE_ENV': JSON.stringify(environment) }),
        rollupModuleResolver({ moduleResolver: inMemoryModuleResolver(options.files), $metadata }),
        rollupTransfrom({ $metadata, options })
    ];

    console.log('>>>> Done with plugins: ');


    if (isCompat(outputConfig)) { // compat
        plugins.push(rollupCompat({ resolveProxyCompat }));
    }

    if (isProd(outputConfig)) {
        plugins.push(rollupMinify(options));
    }

    console.log('>>>> rolling with entry: ', entry);

    return rollup({
        input: entry,
        plugins: plugins,
        onwarn: rollupWarningOverride,
    }).then(
        (bundleFn: any) => {
            console.log('>>>> done rollup ');
            return bundleFn
                .generate({
                    amd: { id: entry },
                    interop: false,
                    strict: false,
                    format,
                })
                .then((result: BundleReport) => {
                    console.log('>>>> done generate ');
                    return {
                        code: result.code,
                        map: result.map,
                        metadata: mergeMetadata($metadata),
                        rawMetadata: $metadata,
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
