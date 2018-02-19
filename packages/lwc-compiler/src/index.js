import { compile as compileBundle} from './compiler';
import { MODES, isProd } from './modes';
import * as replacePlugin from "rollup-plugin-replace";
import minifyPlugin from "./rollup-plugins/minify";
import { transform, transformBundle } from './transformers/transformer';
import { isString } from './utils';


const DEFAULT_TRANSFORM_OPTIONS = { mode: MODES.DEV };

export function compile(entry, options = {}) {
    return compileBundle(entry, options);
}

// TODO: keep here until we move this into its own package to be consumed by rollup-plugin-lwc-compiler
export function transform(src, id, options) {
    return transform(src, id, options);
}

export function transformBundle(src, options) {
    return transformBundle(src, options);
}
