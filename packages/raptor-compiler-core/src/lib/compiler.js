import { extname } from 'path';
import { getSource, mergeMetadata } from './utils';
import transformClass from './transform-class';
import transformTemplate from './transform-template';
import transformBundle from './transform-bundle';
import sourceResolver from './rollup-plugin-source-resolver';
import rollupRemoveAnnotations from './rollup-plugin-remove-annotations';
import { rollup } from 'rollup';

export function compileFile(entry: string, options: any): Promise<any> {
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

export function compileBundle(entry: string, options: any): Promise<any> {
    options = options || {};
    const plugins = [
        sourceResolver(options),
        rollupTransform(options),
        rollupRemoveAnnotations()
    ];

    return new Promise((resolve: (bundleResult: any) => void, reject: (element: HTMLElement) => void) => {
        rollup({ entry, plugins })
        .then((bundle: any) => {
            const normalizedModuleName = [options.componentNamespace, options.componentName].join('-');
            const bundleResult = bundle.generate({
                interop: false,
                format: options.format || 'es',
                moduleId: normalizedModuleName,
            });

            bundleResult.metadata = mergeMetadata(options.$metadata);

            // TODO: Eventually use the AST tree as input so we don't have to re-parse it
            // Bugs on compiler to fix that!
            resolve(transformBundle(bundleResult, options));
        })
        .catch(reject);
    });
}

function rollupTransform(options: any): any {
    return {
        name: 'rollup-transform',
        transform (src: string, filename: string) {
            const result = compileFile(filename, Object.assign({}, { filename }, options));
            options.$metadata[filename] = result.metadata;
            return result;
        }
    }
}
