import * as t from 'babel-types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
} from '../helpers';

function importFromComponentName(name: string): t.ImportDeclaration {
    const localComponentIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localComponentIdentifier)],
        t.stringLiteral(name),
    );
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
): t.Program {
    const imports = state.dependencies.map(cmpClassName =>
        importFromComponentName(cmpClassName),
    );
    const metadata = generateTemplateMetadata(state);

    return t.program([
        ...imports,
        t.exportDefaultDeclaration(templateFn),
        ...metadata,
    ]);
}
