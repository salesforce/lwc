import raptorTemplatePlugin from 'babel-plugin-transform-raptor-template';
import templateCleanupPlugin from 'raptor-html-cleanup-transform';
import { transform } from 'babel-core';

export default function (src: string, options: any): any {
    options = options || {};

    let localBabelConfig = {
        babelrc: false,
        sourceMaps: true,
        plugins: [ raptorTemplatePlugin ],
        filename: options.filename
    };

    localBabelConfig = Object.assign({}, options.babelConfig, localBabelConfig);

    const cleanSrc = templateCleanupPlugin.transform(src);
    const { code, map, metadata } = transform(cleanSrc, localBabelConfig);

    // #FIXME: Returns for now only a subset of the transform result because the ast property in
    // the result makes rollup throw.
    // Returning the AST instead of the generated code would greately improve the compilation time.
    return Promise.resolve({ code, map, metadata });
}
