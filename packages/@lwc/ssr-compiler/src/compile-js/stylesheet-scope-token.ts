/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { generateScopeTokens } from '@lwc/template-compiler';
import { builders as b } from 'estree-toolkit/dist/builders';
import { esTemplate } from '../estemplate';
import type { BlockStatement, ExportNamedDeclaration, Program, VariableDeclaration } from 'estree';

const bStylesheetTokenDeclaration = esTemplate<VariableDeclaration>`
    const stylesheetScopeToken = '${is.literal}';
`;

const bAdditionalDeclarations = [
    esTemplate<VariableDeclaration>`
        const hasScopedStylesheets = defaultScopedStylesheets && defaultScopedStylesheets.length > 0;
    `,
    esTemplate<ExportNamedDeclaration>`
        const stylesheetScopeTokenClass = hasScopedStylesheets ? \` class="\${stylesheetScopeToken}"\` : '';
    `,
    esTemplate<ExportNamedDeclaration>`
        const stylesheetScopeTokenHostClass = hasScopedStylesheets ? \` class="\${stylesheetScopeToken}-host"\` : '';
    `,
    esTemplate<ExportNamedDeclaration>`
        const stylesheetScopeTokenClassPrefix = hasScopedStylesheets ? (stylesheetScopeToken + ' ') : '';
    `,
];

// Scope tokens are associated with a given template. This is assigned here so that it can be used in `generateMarkup`.
const tmplAssignmentBlock = esTemplate<BlockStatement>`
    ${is.identifier}.stylesheetScopeTokenHostClass = stylesheetScopeTokenHostClass;
`;

export function addScopeTokenDeclarations(
    program: Program,
    filename: string,
    namespace: string | undefined,
    componentName: string | undefined
) {
    const { scopeToken } = generateScopeTokens(filename, namespace, componentName);

    program.body.unshift(
        bStylesheetTokenDeclaration(b.literal(scopeToken)),
        ...bAdditionalDeclarations.map((declaration) => declaration())
    );

    program.body.push(tmplAssignmentBlock(b.identifier('tmpl')));
}
