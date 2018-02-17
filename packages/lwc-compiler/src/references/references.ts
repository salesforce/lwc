import * as path from 'path';

import { getReferences as getCssReferences } from './css';
import { getReferences as getHtmlReferences } from './html';
import { getReferences as getJsReferences } from './javascript';
import { ReferenceReport } from './types';

import { LwcBundle } from '../lwc-bundle';

export function getBundleReferences(bundle: LwcBundle): ReferenceReport {
    const result: ReferenceReport = { references: [], diagnostics: []};

    if (!bundle || !bundle.sources) {
        return result;
    }
    // TODO: ts is complaining if [filename, source] is used instead of entry
    return Object.entries(bundle.sources).reduce(
        (result: ReferenceReport, entry: any) => {
            const filename = entry[0];
            const source = entry[1];
            const refResult = getFileReferences(source, filename)
            result.references.push(...refResult.references);
            result.diagnostics.push(...refResult.diagnostics);
            return result;
        },
        result,
    );
}

export function getFileReferences(
    source: string,
    filename: string,
): ReferenceReport {
    const ext = path.extname(filename);

    switch (ext) {
        case '.html':
            return getHtmlReferences(source, filename);
        case '.js':
            return getJsReferences(source, filename);
        case '.css':
            return getCssReferences(source, filename);
        default:
            return { references: [], diagnostics: []};
    }
}
