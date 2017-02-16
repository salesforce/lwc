import { normalizeEntryPath, normalizeOptions } from './lib/utils';
import {compileResource, compileBundle} from './lib/compiler';

const BASE_OPTIONS = {
    babelConfig: {
        babelrc: false,
        sourceMaps: true
    }
};

export function compile(entry: string, options: any): Promise<any> {
    options = options || {};
    entry = normalizeEntryPath(entry);
    options = normalizeOptions(Object.assign({}, { entry }, BASE_OPTIONS, options));
    if (options.bundle) {
        return compileBundle(entry, options);
    } else {
        return compileResource(entry, options);
    }
}

export const version = "__VERSION__";
