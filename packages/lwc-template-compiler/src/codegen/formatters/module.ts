import * as t from 'babel-types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
    kebabcaseToCamelcase
} from '../helpers';
import { ResolvedConfig } from '../../config';

function moduleNameToImport(name: string): t.ImportDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localIdentifier)],
        t.stringLiteral(kebabcaseToCamelcase(name)),
    );
}

function generateSecureImport(): t.ImportDeclaration {
    return t.importDeclaration(
        [t.importSpecifier(t.identifier('secure'), t.identifier('secure'))],
        t.stringLiteral('lwc')
    );
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
    options: ResolvedConfig
): t.Program {
    const { secure } = options;
    const imports = state.dependencies.map(cmpClassName =>
        moduleNameToImport(cmpClassName),
    );

    if (secure) {
        imports.push(generateSecureImport());
    }

    const metadata = generateTemplateMetadata(state);


    return t.program([
        ...imports,
        t.exportDefaultDeclaration(templateFn),
        ...metadata,
    ]);
}
