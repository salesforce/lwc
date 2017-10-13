import { normalizeEntryPath, normalizeOptions } from './utils';
import { compileFile, compileBundle } from './compiler';

const BASE_OPTIONS = {
    format: 'es',
    babelConfig: {
        babelrc: false,
        sourceMaps: true
    }
};

export function compile(entry, options){
    options = options || {};
    entry = normalizeEntryPath(entry);
    options = normalizeOptions(Object.assign({}, { entry }, BASE_OPTIONS, options));
    if (options.bundle) {
        return compileBundle(entry, options);
    } else {
        return Promise.resolve(compileFile(entry, options));
    }
}

export function compileResource(entry, options) {
    options = options || {};
    entry = normalizeEntryPath(entry);
    options = normalizeOptions(Object.assign({}, { entry }, BASE_OPTIONS, options));
    return compileFile(entry, options);
}

export const version = "__VERSION__";
