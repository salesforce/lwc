import * as path from 'path';

import { getReferences as getCssReferences } from './css';
import { getReferences as getHtmlReferences } from './html';
import { getReferences as getJsReferences } from './javascript';
import { Reference } from './types';

import { LwcBundle } from '../lwc-bundle';

export function getBundleReferences(bundle: LwcBundle): Reference[] {
    console.log("BUNDLE", bundle);
    if (!bundle || !bundle.sources) {
        return [];
    }
    // TODO: ts is complaining if [filename, source] is used instead of entry
    return Object.entries(bundle.sources).reduce(
        (refs: Reference[], entry:any) => {
            const filename = entry[0];
            const source = entry[1];
            return [...refs, ...getFileReferences(source, filename)];
        },
        [],
    );
}

export function getFileReferences(
    source: string,
    filename: string,
): Reference[] {
    const ext = path.extname(filename);

    switch (ext) {
        case '.html':
            return getHtmlReferences(source, filename);
        case '.js':
            return getJsReferences(source, filename);
        case '.css':
            return getCssReferences(source, filename);
        default:
            return [];
    }
}
