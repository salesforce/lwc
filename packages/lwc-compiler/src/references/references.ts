import * as path from "path";

import { CompilerOptions } from "../options";
import { Diagnostic } from "../diagnostics/diagnostic";
import { Location } from '../common-interfaces/location';

import { getReferenceReport as getCssReferenceReport } from "./css";
import { getReferenceReport as getHtmlReferenceReport } from "./html";
import { getReferenceReport as getJsReferenceReport } from "./javascript";

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
    | "component"
    | "module";

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
            return getHtmlReferenceReport(source, filename);
        case ".js":
            return getJsReferenceReport(source, filename);
        case ".css":
            return getCssReferenceReport(source, filename);
        default:
            return { references: [], diagnostics: [] };
    }
}
