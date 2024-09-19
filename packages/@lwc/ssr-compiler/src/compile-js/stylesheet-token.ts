import { is } from 'estree-toolkit';
import { generateScopeTokens } from '@lwc/template-compiler';
import { builders as b } from 'estree-toolkit/dist/builders';
import { esTemplate } from '../estemplate';
import type { ExportNamedDeclaration, Program, VariableDeclaration } from 'estree';

function generateStylesheetScopeToken(filename: string) {
    // FIXME: should pass in the namespace since we might not have it from the filename alone
    const split = filename.split('/');
    const namespace = split.at(-3)!;
    const baseName = split.at(-1)!;

    const componentName = baseName.replace(/\.[^.]+$/, '');
    const {
        // FIXME: handle legacy scope token for older API versions
        scopeToken,
    } = generateScopeTokens(filename, namespace, componentName);

    return scopeToken;
}

const bStylesheetTokenDeclaration = esTemplate<VariableDeclaration>`
    const stylesheetScopeToken = '${is.literal}';
`;

const bScopeTokenClassDeclaration = esTemplate<ExportNamedDeclaration>`
    const stylesheetScopeTokenClass = (defaultScopedStylesheets && defaultScopedStylesheets.length > 0) 
        ? (' class="' + ${is.identifier} + '"')
        : '';
`;

const bScopeTokenHostClassDeclaration = esTemplate<ExportNamedDeclaration>`
    export const stylesheetScopeTokenHostClass = (defaultScopedStylesheets && defaultScopedStylesheets.length > 0) 
        ? (' class="' + ${is.identifier} + '-host"')
        : '';
`;

export function addScopeTokenDeclarations(program: Program, filename: string) {
    const scopeToken = generateStylesheetScopeToken(filename);
    program.body.unshift(
        bStylesheetTokenDeclaration(b.literal(scopeToken)),
        bScopeTokenClassDeclaration(b.identifier('stylesheetScopeToken')),
        bScopeTokenHostClassDeclaration(b.identifier('stylesheetScopeToken'))
    );
}
