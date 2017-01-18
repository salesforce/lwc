import { extname } from 'path';
import { getSource, mergeMetadata } from './utils';
import transformClass from './transform-class';
import transformTemplate from './transform-template';
import sourceResolver from './rollup-plugin-source-resolver';
import rollupRemoveAnnotations from './rollup-plugin-remove-annotations';
import { rollup } from 'rollup';

export function compileResource(entry, options) {
    const ext = extname(entry);
    const src = getSource(entry, options.sources);

    options.filename = entry;

    if (ext === '.html') {
        return transformTemplate(src, options);
    } else if (ext === '.js') {
        return transformClass(src, options);
    } else {
        throw new Error(`Can't compile extension ${ext}`);
    }
}

export function compileBundle(entry, options) {
    options = options || {};
    const plugins = [
        sourceResolver(options),
        rollupTransform(options),
        rollupRemoveAnnotations()
    ];

    return new Promise((resolve, reject) => {
        rollup({ entry, plugins })
        .then((bundle) => {
            const bundleResult = bundle.generate({ format: options.format });
            bundleResult.metadata = mergeMetadata(options.$metadata);
            resolve(bundleResult);
        })
        .catch(reject);
    });
}

function rollupTransform(options) {
    return {
        name: 'rollup-transform',
        transform (src, filename) {
            return compileResource(filename, Object.assign({ filename }, options)).then((result) => {
                options.$metadata[filename] = result.metadata;
                return result;
            });
        }
    }
}