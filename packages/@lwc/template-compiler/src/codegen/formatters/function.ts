/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import State from '../../state';
import * as t from '../../shared/estree';
import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_MODULES_PARAMETER } from '../../shared/constants';

export function format(templateFn: t.FunctionDeclaration, state: State): t.Program {
    const lookups = state.dependencies.map((cmpClassName) => {
        const localIdentifier = identifierFromComponentName(cmpClassName);

        return t.variableDeclaration('const', [
            t.variableDeclarator(
                localIdentifier,
                t.memberExpression(
                    t.identifier(TEMPLATE_MODULES_PARAMETER),
                    t.literal(cmpClassName),
                    {
                        computed: true,
                    }
                )
            ),
        ]);
    });
    const metadata = generateTemplateMetadata(state);

    return t.program([
        ...lookups,
        templateFn,
        ...metadata,
        t.returnStatement(t.identifier(TEMPLATE_FUNCTION_NAME)),
    ]);
}
