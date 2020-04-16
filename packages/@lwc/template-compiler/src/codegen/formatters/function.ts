/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '@babel/types';

import State from '../../state';
import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_MODULES_PARAMETER } from '../../shared/constants';

function moduleNameToLookup(name: string): t.VariableDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.variableDeclaration('const', [
        t.variableDeclarator(
            localIdentifier,
            t.memberExpression(
                t.identifier(TEMPLATE_MODULES_PARAMETER),
                t.stringLiteral(name),
                true
            )
        ),
    ]);
}

export function format(templateFn: t.FunctionDeclaration, state: State): t.Program {
    const lookups = state.dependencies.map((cmpClassName) => moduleNameToLookup(cmpClassName));
    const metadata = generateTemplateMetadata(state);

    return t.program([
        ...lookups,
        templateFn,
        ...metadata,
        t.returnStatement(t.identifier(TEMPLATE_FUNCTION_NAME)),
    ]);
}
