import * as t from 'babel-types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
} from '../helpers';

function moduleNameToImport(name: string): t.ImportDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localIdentifier)],
        t.stringLiteral(name),
    );
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
): t.Program {
    const imports = state.dependencies.map(cmpClassName =>
        moduleNameToImport(cmpClassName),
    );
    const metadata = generateTemplateMetadata(state);

    return t.program([
        ...imports,
        t.exportDefaultDeclaration(templateFn),
        ...metadata,
    ]);
}
