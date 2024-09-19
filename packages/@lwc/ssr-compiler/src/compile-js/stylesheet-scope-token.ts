import { is } from 'estree-toolkit';
import { generateScopeTokens } from '@lwc/template-compiler';
import { builders as b } from 'estree-toolkit/dist/builders';
import { esTemplate } from '../estemplate';
import type { BlockStatement, ExportNamedDeclaration, Program, VariableDeclaration } from 'estree';

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

const bScopeTokenHasScopedStylesheetsDeclaration = esTemplate<VariableDeclaration>`
    const hasScopedStylesheets = defaultScopedStylesheets && defaultScopedStylesheets.length > 0;
`;

const bScopeTokenClassDeclaration = esTemplate<ExportNamedDeclaration>`
    const stylesheetScopeTokenClass = hasScopedStylesheets
        ? \` class="\${stylesheetScopeToken}"\`
        : '';
`;

const bScopeTokenHostClassDeclaration = esTemplate<ExportNamedDeclaration>`
    const stylesheetScopeTokenHostClass = hasScopedStylesheets
        ? \` class="\${stylesheetScopeToken}-host"\`
        : '';
`;

const bScopeTokenClassPrefixDeclaration = esTemplate<ExportNamedDeclaration>`
    const stylesheetScopeTokenClassPrefix = hasScopedStylesheets
        ? (stylesheetScopeToken + ' ')
        : '';
`;

const tmplAssignmentBlock = esTemplate<BlockStatement>`
    Object.assign(${is.identifier}, {
        stylesheetScopeToken,
        hasScopedStylesheets,
        stylesheetScopeTokenClass,
        stylesheetScopeTokenHostClass,
        stylesheetScopeTokenClassPrefix
    });
`;

export function addScopeTokenDeclarations(program: Program, filename: string) {
    const scopeToken = generateStylesheetScopeToken(filename);

    program.body.unshift(
        bStylesheetTokenDeclaration(b.literal(scopeToken)),
        bScopeTokenHasScopedStylesheetsDeclaration(),
        bScopeTokenClassDeclaration(),
        bScopeTokenHostClassDeclaration(),
        bScopeTokenClassPrefixDeclaration()
    );

    program.body.push(tmplAssignmentBlock(b.identifier('tmpl')));
}
