import traverse, { NodePath } from 'babel-traverse';
import * as t from 'babel-types';
import { parse } from 'babylon';

import { Diagnostic, DiagnosticLevel } from '../diagnostics/diagnostic';
import { ReferenceReport } from './references';
import { isUndefined } from '../utils';

const APEX_PREFIX = '@apex';
const LABEL_PREFIX = '@label';
const RESOURCE_URL_PREFIX = '@resource-url';

export function isGvpSource(prefix: string) {
    return (source: string) => source.startsWith(`${prefix}/`);
}

const isApexSource = isGvpSource(APEX_PREFIX);
const isLabelSource = isGvpSource(LABEL_PREFIX);
const isResourceUrlSource = isGvpSource(RESOURCE_URL_PREFIX);

function getGvpId(path: NodePath<t.ImportDeclaration>) {
    const { value } = path.node.source;
    const res = /^@[\w-]+\/(.+)$/.exec(value);
    return res![1];
}
function assertGvpSource(path: NodePath<t.ImportDeclaration>): Diagnostic[]  {
    const { value } = path.node.source;
    const res = /^@[\w-]+\/(.+)$/.exec(value);
    const diagnostics: Diagnostic[] = [];

    if (!res) {
        diagnostics.push({
            message: String(`Unexpected GVP source for ${value}`),
            level: DiagnosticLevel.Fatal,
            filename: value,
        });
    }
    return diagnostics;
}

function assertOnlyDefaultImport(
    path: NodePath<t.ImportDeclaration>,
    error: string,
) {
    const hasNamedImport = path.node.specifiers.some(
        node => !t.isImportDefaultSpecifier(node),
    );
    const diagnostics: Diagnostic[] = [];

    if (hasNamedImport) {
        const { value } = path.node.source;
        diagnostics.push({
            message: error,
            level: DiagnosticLevel.Fatal,
            filename: value,
        });
    }
    return diagnostics;
}

function getResourceReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): ReferenceReport {
    const defaultDiagnostics = assertOnlyDefaultImport(
        path,
        `${RESOURCE_URL_PREFIX} modules only support default imports.`,
    );
    const sourceDiagnostics = assertGvpSource(path);

    const diagnostics = [
        ...defaultDiagnostics,
        ...sourceDiagnostics
    ];

    const result: ReferenceReport = {
        diagnostics,
        references: [],
    };

    if (diagnostics.length > 0) {
        return result;
    }

    // process reference
    const id = getGvpId(path);
    const { source } = path.node;
    result.references.push({
        id,
        type: 'resourceUrl',
        file: filename,
        locations: [
            {
                start: source.start + RESOURCE_URL_PREFIX.length + 2,
                length: id.length,
            },
        ],
    });
    return result;
}

function getLabelReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): ReferenceReport {
    const defaultDiagnostics = assertOnlyDefaultImport(
        path,
        `${LABEL_PREFIX} modules only support default imports.`,
    );

    const sourceDiagnostics = assertGvpSource(path);

    const diagnostics = [
        ...defaultDiagnostics,
        ...sourceDiagnostics
    ];
    const result: ReferenceReport = {
        diagnostics,
        references: [],
    };

    if (diagnostics.length > 0) {
        return result;
    }

    const id = getGvpId(path);
    const { source } = path.node;
    result.references.push({
        id,
        type: 'label',
        file: filename,
        locations: [
            {
                start: source.start + LABEL_PREFIX.length + 2,
                length: id.length,
            },
        ],
    });
    return result;
}

function getApexReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): ReferenceReport {
    const defaultDiagnostics = assertOnlyDefaultImport(
        path,
        `${APEX_PREFIX} modules only support default imports.`,
    );
    const sourceDiagnostics = assertGvpSource(path);

    const diagnostics = [
        ...defaultDiagnostics,
        ...sourceDiagnostics
    ];
    const result: ReferenceReport = {
        diagnostics,
        references: [],
    };

    if (diagnostics.length > 0) {
        return result;
    }

    const id = getGvpId(path);
    const { source } = path.node;

    result.references.push({
        id,
        type: 'apexMethod',
        file: filename,
        locations: [
            {
                start: source.start + APEX_PREFIX.length + 2,
                length: id.length,
            },
        ],
    });

    return result;
}

function sfdcReferencesVisitor(result: ReferenceReport, filename: string) {
    return {
        ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
            const { value } = path.node.source;

            let importReferences: ReferenceReport | undefined;

            if (isResourceUrlSource(value)) {
                importReferences = getResourceReferences(path, filename);
            } else if (isLabelSource(value)) {
                importReferences = getLabelReferences(path, filename);
            } else if (isApexSource(value)) {
                importReferences = getApexReferences(path, filename);
            }

            if (!isUndefined(importReferences)) {
                const { references, diagnostics } = importReferences;

                // don't add references if we have errors
                if (diagnostics && diagnostics.length) {
                    result.diagnostics.push(...diagnostics);
                } else {
                    result.references.push(...references);
                }
            }
        },
    };
}

export function getReferences(source: string, filename: string): ReferenceReport {
    const ast = parse(source, {
        sourceFilename: filename,
        sourceType: 'module',
        plugins: ['classProperties', 'decorators', 'objectRestSpread'],
    });

    const result = { references: [], diagnostics: [] };
    traverse(ast, sfdcReferencesVisitor(result, filename));

    return result;
}
