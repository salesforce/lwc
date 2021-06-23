/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import State from '../../state';
import * as t from '../../shared/estree';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_MODULES_PARAMETER } from '../../shared/constants';

import CodeGen from '../codegen';
import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
    codeGen: CodeGen
): t.Program {
    const lookups = Array.from(codeGen.referencedComponents).map((name) => {
        const localIdentifier = identifierFromComponentName(name);

        return t.variableDeclaration('const', [
            t.variableDeclarator(
                localIdentifier,
                t.memberExpression(t.identifier(TEMPLATE_MODULES_PARAMETER), t.literal(name), {
                    computed: true,
                })
            ),
        ]);
    });
    const metadata = generateTemplateMetadata(state, codeGen);

    return t.program([
        ...lookups,
        templateFn,
        ...metadata,
        t.returnStatement(t.identifier(TEMPLATE_FUNCTION_NAME)),
    ]);
}
