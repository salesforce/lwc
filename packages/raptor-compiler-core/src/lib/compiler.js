import { extname } from 'path';
import { getSource, mergeMetadata, rollupWarningOverride } from './utils';
import transformClass from './transform-class';
import transformTemplate from './transform-template';
import transformBundle from './transform-bundle';
import { MODES } from './constants';
import sourceResolver from './rollup-plugin-source-resolver';
import { rollup } from 'rollup';

export function compileFile(entry, options) {
    const ext = extname(entry);
    const src = getSource(entry, options.sources);

    options.filename = entry;

    if (ext === '.html') {
        return transformTemplate(src, options);
    } else if (ext === '.js' || ext === '.ts') {
        return transformClass(src, options);
    } else {
        throw new Error(`Can't compile extension ${ext}`);
    }
}

export function compileBundle(entry, options) {
    options = options || {};
    const plugins = [
        sourceResolver(options),
        rollupTransform(options)
    ];

    return new Promise((resolve, reject) => {
        rollup({ entry, plugins, onwarn: rollupWarningOverride })
        .then((bundle) => {
            const devBundleOptions = {
                moduleId: options.normalizedModuleName,
                interop: false,
                useStrict: false,
                format: options.format
            };

            const isDevMode = options.mode === MODES.DEV;
            const bundleOptions = isDevMode ?  devBundleOptions : { format: 'es' };
            const bundleResult = bundle.generate(bundleOptions);
            bundleResult.metadata = mergeMetadata(options.$metadata);

            // In dev mode we don't need to do any more transforms, return early
            if (isDevMode) {
                resolve({
                    code: bundleResult.code,
                    map: bundleResult.map,
                    metadata: bundleResult.metadata
                });
            } else {
                // For any other mode, we need to do more transformations
                resolve(transformBundle(entry, bundleResult, options));
            }
        })
        .catch(reject);
    });
}

function rollupTransform(options) {
    return {
        name: 'rollup-transform',
        transform (src, filename) {
            const result = compileFile(filename, Object.assign({}, { filename }, options));
            options.$metadata[filename] = result.metadata;
            return result;
        }
    }
}
