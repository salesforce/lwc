import * as t from 'babel-types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
} from '../helpers';
import {
    TEMPLATE_FUNCTION_NAME,
    TEMPLATE_COMPONENT_PARAMETER,
} from '../../shared/constants';

function lookupFromComponentName(name: string): t.VariableDeclaration {
    const localComponentIdentifier = identifierFromComponentName(name);

    return t.variableDeclaration('const', [
        t.variableDeclarator(
            localComponentIdentifier,
            t.memberExpression(
                t.identifier(TEMPLATE_COMPONENT_PARAMETER),
                t.stringLiteral(name),
                true,
            ),
        ),
    ]);
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
): t.Program {
    const lookups = state.dependencies.map(cmpClassName =>
        lookupFromComponentName(cmpClassName),
    );
    const metadata = generateTemplateMetadata(state);

    return t.program([
        ...lookups,
        templateFn,
        ...metadata,
        t.returnStatement(t.identifier(TEMPLATE_FUNCTION_NAME)),
    ]);
}
