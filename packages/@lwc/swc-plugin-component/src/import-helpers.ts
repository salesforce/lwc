/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type {
    Program,
    ImportDeclaration,
    NamedImportSpecifier,
    ImportDefaultSpecifier,
    StringLiteral,
    Identifier,
    Span,
} from '@swc/types';

/** A dummy span used for synthetic/injected AST nodes */
const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

function makeStringLiteral(value: string): StringLiteral {
    return { type: 'StringLiteral', value, span: DUMMY_SPAN, raw: JSON.stringify(value) };
}

/**
 * Returns the set of all locally-bound names in program scope
 * (from import specifiers and top-level variable declarations).
 * Used to avoid name collisions when injecting imports.
 */
function collectBoundNames(program: Program): Set<string> {
    const names = new Set<string>();
    const body = program.type === 'Module' ? program.body : (program as any).body;
    for (const node of body) {
        if (node.type === 'ImportDeclaration') {
            const decl = node as ImportDeclaration;
            for (const spec of decl.specifiers) {
                if (spec.type === 'ImportSpecifier') {
                    names.add((spec as NamedImportSpecifier).local.value);
                } else if (spec.type === 'ImportDefaultSpecifier') {
                    names.add((spec as ImportDefaultSpecifier).local.value);
                } else if (spec.type === 'ImportNamespaceSpecifier') {
                    names.add((spec as any).local.value);
                }
            }
        } else if (node.type === 'VariableDeclaration' || node.type === 'ExpressionStatement') {
            // Top-level variable declarations
            if (node.type === 'VariableDeclaration') {
                for (const decl of (node as any).declarations) {
                    if (decl.id?.type === 'Identifier') {
                        names.add(decl.id.value);
                    }
                }
            }
        }
    }
    return names;
}

/**
 * Finds an existing named import specifier from a given source.
 * Returns the local name if found.
 */
function findExistingNamedImport(
    program: Program,
    specifier: string,
    source: string
): string | undefined {
    const body = program.type === 'Module' ? program.body : (program as any).body;
    for (const node of body) {
        if (node.type === 'ImportDeclaration') {
            const decl = node as ImportDeclaration;
            if (decl.source.value === source) {
                for (const spec of decl.specifiers) {
                    if (spec.type === 'ImportSpecifier') {
                        const named = spec as NamedImportSpecifier;
                        const importedName = named.imported
                            ? named.imported.type === 'Identifier'
                                ? named.imported.value
                                : named.imported.value
                            : named.local.value;
                        if (importedName === specifier) {
                            return named.local.value;
                        }
                    }
                }
            }
        }
    }
    return undefined;
}

/**
 * Ensures `import { specifier } from 'source'` exists in program.body.
 * Returns the local name bound to the import (may differ from specifier if collision avoided).
 */
export function injectNamedImport(program: Program, specifier: string, source: string): string {
    // Check if it already exists
    const existing = findExistingNamedImport(program, specifier, source);
    if (existing !== undefined) {
        return existing;
    }

    // Pick a local name, avoiding collisions
    const boundNames = collectBoundNames(program);
    let localName = specifier;
    if (boundNames.has(localName)) {
        // Use underscore-prefixed alias to avoid collision
        localName = `_${specifier}`;
        let counter = 2;
        while (boundNames.has(localName)) {
            localName = `_${specifier}${counter++}`;
        }
    }

    // Check if there's already an import from this source we can add to
    const body = program.type === 'Module' ? program.body : (program as any).body;
    for (const node of body) {
        if (node.type === 'ImportDeclaration') {
            const decl = node as ImportDeclaration;
            if (decl.source.value === source && !decl.typeOnly) {
                // Skip namespace imports (import * as foo) — named specifiers cannot be
                // combined with a namespace specifier in the same import declaration.
                const hasNamespaceSpecifier = decl.specifiers.some(
                    (spec) => spec.type === 'ImportNamespaceSpecifier'
                );
                if (hasNamespaceSpecifier) {
                    continue;
                }
                // Add to existing import
                const namedSpec: NamedImportSpecifier = {
                    type: 'ImportSpecifier',
                    local: makeIdentifier(localName),
                    imported: localName !== specifier ? makeIdentifier(specifier) : undefined,
                    isTypeOnly: false,
                    span: DUMMY_SPAN,
                };
                decl.specifiers.push(namedSpec);
                return localName;
            }
        }
    }

    // Create a new import declaration and prepend it
    const namedSpec: NamedImportSpecifier = {
        type: 'ImportSpecifier',
        local: makeIdentifier(localName),
        imported: localName !== specifier ? makeIdentifier(specifier) : undefined,
        isTypeOnly: false,
        span: DUMMY_SPAN,
    };

    const importDecl: ImportDeclaration = {
        type: 'ImportDeclaration',
        specifiers: [namedSpec],
        source: makeStringLiteral(source),
        typeOnly: false,
        span: DUMMY_SPAN,
    };

    body.unshift(importDecl);
    return localName;
}

/**
 * Ensures `import <hint> from 'source'` exists in program.body.
 * Returns the Identifier node used for the default import.
 * Returning the actual Identifier (with its original ctxt) is critical to avoid SWC
 * renaming the binding when we later reference it via a synthesized Identifier with ctxt:0.
 */
export function injectDefaultImport(
    program: Program,
    source: string,
    nameHint: string
): Identifier {
    // Check if a default import from this source already exists
    const body = program.type === 'Module' ? program.body : (program as any).body;
    for (const node of body) {
        if (node.type === 'ImportDeclaration') {
            const decl = node as ImportDeclaration;
            if (decl.source.value === source) {
                for (const spec of decl.specifiers) {
                    if (spec.type === 'ImportDefaultSpecifier') {
                        // Return the actual Identifier node (preserving its ctxt)
                        return (spec as ImportDefaultSpecifier).local as unknown as Identifier;
                    }
                }
            }
        }
    }

    // Pick a name, avoiding collisions
    const boundNames = collectBoundNames(program);
    let localName = nameHint;
    let counter = 2;
    while (boundNames.has(localName)) {
        localName = `${nameHint}${counter++}`;
    }

    const localId = makeIdentifier(localName);

    const defaultSpec: ImportDefaultSpecifier = {
        type: 'ImportDefaultSpecifier',
        local: localId,
        span: DUMMY_SPAN,
    };

    const importDecl: ImportDeclaration = {
        type: 'ImportDeclaration',
        specifiers: [defaultSpec],
        source: makeStringLiteral(source),
        typeOnly: false,
        span: DUMMY_SPAN,
    };

    body.unshift(importDecl);
    return localId;
}
