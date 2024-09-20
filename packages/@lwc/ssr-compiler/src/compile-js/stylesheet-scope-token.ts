import { is } from 'estree-toolkit';
import { generateScopeTokens } from '@lwc/template-compiler';
import { builders as b } from 'estree-toolkit/dist/builders';
import { esTemplate } from '../estemplate';
import type { BlockStatement, ExportNamedDeclaration, Program, VariableDeclaration } from 'estree';

function generateStylesheetScopeToken(filename: string) {
    // FIXME: we should be getting the namespace/name from the config options,
    // since these actually come from the component filename, not the template filename.
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

export function addScopeTokenDeclarations(program: Program, filename: string) {
    const scopeToken = generateStylesheetScopeToken(filename);

    program.body.unshift(
        bStylesheetTokenDeclaration(b.literal(scopeToken)),
        ...bAdditionalDeclarations.map((declaration) => declaration())
    );

    program.body.push(tmplAssignmentBlock(b.identifier('tmpl')));
}
