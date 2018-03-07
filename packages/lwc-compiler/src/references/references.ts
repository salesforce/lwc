import * as path from "path";

import { CompilerOptions } from "../options";
import { Diagnostic } from "../diagnostics/diagnostic";
import { Location } from '../common-interfaces/location';

import { getReferences as getCssReferences } from "./css";
import { getReferences as getHtmlReferences } from "./html";
import { getReferences as getJsReferences } from "./javascript";


export interface Reference {
    type: ReferenceType;
    id: string;
    file: string;
    locations: Location[];
}

export interface ReferenceReport {
    references: Reference[];
    diagnostics: Diagnostic[];
}

export type ReferenceType =
    | "resourceUrl"
    | "label"
    | "apexClass"
    | "apexMethod"
    | "sobjectClass"
    | "sobjectField"
    | "component";

export function getBundleReferences({
    files
}: CompilerOptions): ReferenceReport {
    const references: Reference[] = [];
    const diagnostics: Diagnostic[] = [];

    for (const [filename, content] of Object.entries(files)) {
        const refResult = getFileReferences(content, filename);
        references.push(...refResult.references);
        diagnostics.push(...refResult.diagnostics);
    }

    return {
        references,
        diagnostics
    };
}

export function getFileReferences(
    source: string,
    filename: string
): ReferenceReport {
    const ext = path.extname(filename);

    switch (ext) {
        case ".html":
            return getHtmlReferences(source, filename);
        case ".js":
            return getJsReferences(source, filename);
        case ".css":
            return getCssReferences(source, filename);
        default:
            return { references: [], diagnostics: [] };
    }
}
