import { rollup } from 'rollup';

import { isCompat, isProd } from './modes';

import rollupModuleResolver from './rollup-plugins/module-resolver';
import rollupTransfrom from './rollup-plugins/transform';
import rollupCompat from './rollup-plugins/compat';
import rollupMinify from './rollup-plugins/minify';

function rollupWarningOverride(warning) {
    if (warning.code && warning.code === 'UNRESOLVED_IMPORT') {
        return;
    }

    console.warn(warning.message);
}

function mergeMetadata(metadata) {
    const dependencies = metadata.rollupDependencies;
    const labels = [];

    for (let i in metadata) {
        dependencies.push(...(metadata[i].templateDependencies || []));
        dependencies.push(...(metadata[i].classDependencies || []));
        labels.push(...(metadata[i].labels || []));
    }

    return {
        bundleDependencies: Array.from(new Set(dependencies)),
        bundleLabels: labels,
    };
}

export default function bundle(entry, options = {}) {
    const plugins = [rollupModuleResolver(options), rollupTransfrom(options)];

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
    })
        .then(bundle => {
            return bundle.generate({
                amd: {
                    id: options.normalizedModuleName,
                },
                interop: false,
                strict: false,
                format: options.format,
            });
        })
        .then(result => {
            return {
                code: result.code,
                map: result.map,
                metadata: mergeMetadata(options.$metadata),
            };
        });
}
