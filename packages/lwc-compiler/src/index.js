import { compile as compileBundle} from './compiler';
import { MODES, isProd } from './modes';
import transformFile from './transform';
import * as replacePlugin from "rollup-plugin-replace";
import minifyPlugin from "./rollup-plugins/minify";
import { isString } from './utils';

const DEFAULT_TRANSFORM_OPTIONS = { mode: MODES.DEV };

export function compile(entry, options = {}) {
    return compileBundle(entry, options);
}

export function transform(src, id, options) {
    if (!isString(src)) {
        throw new Error(`Expect a string for source. Received ${src}`);
    }

    if (!isString(id)) {
        throw new Error(`Expect a string for id. Received ${id}`);
    }

    options = Object.assign({}, DEFAULT_TRANSFORM_OPTIONS, options);

    return transformFile(src, id, options);
}

export function transformBundle(src, options) {
    const mode = options.mode;

    if (isProd(mode)) {
        const rollupReplace = replacePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') });
        const rollupMinify = minifyPlugin(options);
        const resultReplace = rollupReplace.transform(src, '$__tmpBundleSrc');
        const result = rollupMinify.transformBundle(resultReplace ? resultReplace.code : src);

        src = result.code;
    }

    return src;
}
