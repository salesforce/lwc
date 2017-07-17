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

export function compileBundle(entry, options = {}) {
    const isDevMode = options.mode === MODES.DEV;
    const plugins = [
        sourceResolver(options),
        rollupTransform(options)
    ];

    return rollup({
        entry,
        plugins,
        onwarn: rollupWarningOverride
    }).then(bundle => {
        const devBundleOptions = {
            moduleId: options.normalizedModuleName,
            interop: false,
            useStrict: false,
            format: options.format
        };

        const bundleOptions = isDevMode ?  devBundleOptions : { format: 'es' };
        return bundle.generate(bundleOptions);
    }).then(result => {
        result.metadata = mergeMetadata(options.$metadata);

        // In dev mode we don't need to do any more transforms, return early
        if (isDevMode) {
            return {
                code: result.code,
                map: result.map,
                metadata: result.metadata
            };
        } else {
            // For any other mode, we need to do more transformations
            return transformBundle(entry, result, options);
        }
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
