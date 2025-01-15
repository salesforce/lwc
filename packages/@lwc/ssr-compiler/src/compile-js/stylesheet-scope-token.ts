/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { is } from 'estree-toolkit';
import { generateScopeTokens } from '@lwc/template-compiler';
import { builders as b } from 'estree-toolkit';
import { esTemplate } from '../estemplate';
import type { ExpressionStatement, Program, VariableDeclaration } from 'estree';

const bStylesheetTokenDeclaration = esTemplate`
    const stylesheetScopeToken = '${is.literal}';
`<VariableDeclaration>;

const bHasScopedStylesheetsDeclaration = esTemplate`
    const hasScopedStylesheets = defaultScopedStylesheets !== undefined && defaultScopedStylesheets.length > 0;
`<VariableDeclaration>;

// Scope tokens are associated with a given template. This is assigned here so that it can be used in `generateMarkup`.
// We also need to keep track of whether the template has any scoped styles or not so that we can render (or not) the
// scope token.
const tmplAssignmentBlock = esTemplate`
${/* template */ is.identifier}.hasScopedStylesheets = hasScopedStylesheets;
${/* template */ 0}.stylesheetScopeToken = stylesheetScopeToken;
`<ExpressionStatement[]>;

export function addScopeTokenDeclarations(
    program: Program,
    filename: string,
    namespace: string | undefined,
    componentName: string | undefined
) {
    const { scopeToken } = generateScopeTokens(filename, namespace, componentName);

    program.body.unshift(
        bStylesheetTokenDeclaration(b.literal(scopeToken)),
        bHasScopedStylesheetsDeclaration()
    );

    program.body.push(...tmplAssignmentBlock(b.identifier('tmpl')));
}
