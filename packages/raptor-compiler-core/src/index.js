import { normalizeEntryPath, normalizeOptions } from './lib/utils';
import {compileResource, compileComponentBundle} from './lib/compiler';

const BASE_OPTIONS = {
    babelConfig: { 
        babelrc: false,
        sourceMaps: true 
    }
};

export function compile(entry, options = {}) {
    entry = normalizeEntryPath(entry);
    options = normalizeOptions(Object.assign({ entry }, BASE_OPTIONS, options));

    if (options.componentBundle) {
        return compileComponentBundle(entry, options);
    } else {
        return compileResource(entry, options);
    }
}

export const version = "__VERSION__";