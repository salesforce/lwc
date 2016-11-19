import { extname, normalize, join, sep } from 'path';

export function normalizeEntryPath(path) {
    path = normalize(path.replace(/\/$/, ''));
    return extname(path) ? path : join(path, path.split(sep).pop() + '.js' );
}