import { extname } from 'path';
import { getSource, mergeMetadata } from './utils';
import transformClass from './transform-class';
import transformTemplate from './transform-template';
import transformBundle from './transform-bundle';
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
        rollup({ entry, plugins })
        .then((bundle) => {
            const bundleResult = bundle.generate({ format: 'es' });
            bundleResult.metadata = mergeMetadata(options.$metadata);
            // TODO: Eventually use the AST tree as input so we don't have to re-parse it
            // Bugs on compiler to fix that!
            resolve(transformBundle(entry, bundleResult, options));
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
