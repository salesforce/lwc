import { compile as compileBundle} from './compiler';

export function compile(entry, options = {}) {
    return compileBundle(entry, options);
}
