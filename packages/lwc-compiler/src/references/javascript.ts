import { Reference } from './types';
import traverse, { NodePath } from 'babel-traverse';
import * as t from 'babel-types';
import { parse } from 'babylon';

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

    if (!res) {
        throw new Error(`Unexpected GVP source for ${value}`);
    }

    return res[1];
}

function assertOnlyDefaultImport(
    path: NodePath<t.ImportDeclaration>,
    error: string,
) {
    const hasNamedImport = path.node.specifiers.some(
        node => !t.isImportDefaultSpecifier(node),
    );

    if (hasNamedImport) {
        // TODO: convert into diagnostic
        throw new Error(error);
    }
}

function getResourceReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): Reference[] {
    assertOnlyDefaultImport(
        path,
        `${RESOURCE_URL_PREFIX} modules only support default imports.`,
    );

    const id = getGvpId(path);
    const { source } = path.node;

    return [
        {
            id,
            type: 'resourceUrl',
            file: filename,
            locations: [
                {
                    start: source.start + RESOURCE_URL_PREFIX.length + 2,
                    length: id.length,
                },
            ],
        },
    ];
}

function getLabelReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): Reference[] {
    assertOnlyDefaultImport(
        path,
        `${LABEL_PREFIX} modules only support default imports.`,
    );

    const id = getGvpId(path);
    const { source } = path.node;

    return [
        {
            id,
            type: 'label',
            file: filename,
            locations: [
                {
                    start: source.start + LABEL_PREFIX.length + 2,
                    length: id.length,
                },
            ],
        },
    ];
}

function getApexReferences(
    path: NodePath<t.ImportDeclaration>,
    filename: string,
): Reference[] {
    assertOnlyDefaultImport(
        path,
        `${APEX_PREFIX} modules only support default imports.`,
    );

    const id = getGvpId(path);
    const { source } = path.node;

    return [
        {
            id,
            type: 'apexMethod',
            file: filename,
            locations: [
                {
                    start: source.start + APEX_PREFIX.length + 2,
                    length: id.length,
                },
            ],
        },
    ];
}

function sfdcReferencesVisitor(references: Reference[], filename: string) {
    return {
        ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
            const { value } = path.node.source;

            let importReferences: Reference[] = [];

            if (isResourceUrlSource(value)) {
                importReferences = getResourceReferences(path, filename);
            } else if (isLabelSource(value)) {
                importReferences = getLabelReferences(path, filename);
            } else if (isApexSource(value)) {
                importReferences = getApexReferences(path, filename);
            }

            references.push(...importReferences);
        },
    };
}

export function getReferences(source: string, filename: string): Reference[] {
    const references: Reference[] = [];

    const ast = parse(source, {
        sourceFilename: filename,
        sourceType: 'module',
        plugins: ['classProperties', 'decorators', 'objectRestSpread'],
    });

    traverse(ast, sfdcReferencesVisitor(references, filename));

    return references;
}
