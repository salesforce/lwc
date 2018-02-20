import { rollup } from 'rollup';
import * as rollupPluginReplace from 'rollup-plugin-replace';

import { isCompat, isProd } from './modes';

import rollupModuleResolver from './rollup-plugins/module-resolver';
import rollupTransfrom from './rollup-plugins/transform';
import rollupCompat from './rollup-plugins/compat';
import rollupMinify from './rollup-plugins/minify';
import { DiagnosticLevel } from './diagnostics/diagnostic';

function rollupWarningOverride(warning) {
    if (warning.code && warning.code === 'UNRESOLVED_IMPORT') {
        return;
    }

    console.warn(warning.message);
}

function mergeMetadata(metadata) {
    const dependencies = new Map((metadata.rollupDependencies || []).map(d => ([d, 'module'])));
    const decorators = [];

    for (let i in metadata) {
        (metadata[i].templateDependencies || []).forEach(td => (dependencies.set(td, 'component')));
        decorators.push(...(metadata[i].decorators || []));
    }

    return {
        decorators,
        references: Array.from(dependencies).map(d => ({name: d[0], type: d[1]}))
    };
}


export default function bundle(entry, options = {}) {
    const environment = options.env.NODE_ENV || process.env.NODE_ENV;
    const plugins = [
        rollupPluginReplace({ 'process.env.NODE_ENV': JSON.stringify(environment) }),
        rollupModuleResolver(options),
        rollupTransfrom(options)
    ];

    if (isCompat(options.mode)) {
        plugins.push(rollupCompat(options));
    }

    if (isProd(options.mode)) {
        plugins.push(rollupMinify(options));
    }

    return rollup({
        input: entry,
        plugins: plugins,
        onwarn: rollupWarningOverride,
    }).then(
        (bundleFn) => {
            return bundleFn
                .generate({
                    amd: { id: options.normalizedModuleName },
                    interop: false,
                    strict: false,
                    format: options.format,
                    globals: options.globals
                })
                .then((result) => {
                    return {
                        code: result.code,
                        map: result.map,
                        metadata: mergeMetadata(options.$metadata),
                        rawMetadata: options.$metadata,
                        diagnostics: [],
                    };
                }, (error) => {
                    return handleFailure(error, entry);
                });
        }, (error) => {
            return handleFailure(error, entry);
        });
}

function handleFailure(error, filename) {
    // TODO:  do we need location?
    const diagnostic = {
        level: DiagnosticLevel.Fatal,
        filename,
        message: error.message,
    };
    return { diagnostics: [diagnostic] };
}
