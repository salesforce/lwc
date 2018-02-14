import * as path from 'path';

import { getReferences as getCssReferences } from './css';
import { getReferences as getHtmlReferences } from './html';
import { getReferences as getJsReferences } from './javascript';
import { Reference } from './types';

import { LwcBundle } from '../lwc-bundle';

export function getBundleReferences(bundle: LwcBundle): Reference[] {
    return Object.entries(bundle.sources).reduce(
        (refs: Reference[], [filename, source]) => {
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

// TODO:  id mapping format will most likely require name, namespace, type, and a list of locations.
