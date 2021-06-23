/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '../../shared/estree';
import { kebabcaseToCamelcase } from '../../shared/naming';
import {
    TEMPLATE_FUNCTION_NAME,
    SECURE_REGISTER_TEMPLATE_METHOD_NAME,
    LWC_MODULE_NAME,
} from '../../shared/constants';

import CodeGen from '../codegen';
import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';
import State from '../../state';

function generateComponentImports(codeGen: CodeGen): t.ImportDeclaration[] {
    return Array.from(codeGen.referencedComponents).map((name) => {
        const localIdentifier = identifierFromComponentName(name);

        return t.importDeclaration(
            [t.importDefaultSpecifier(localIdentifier)],
            t.literal(kebabcaseToCamelcase(name))
        );
    });
}

function generateLwcApisImport(codeGen: CodeGen): t.ImportDeclaration {
    const imports = Array.from(codeGen.usedLwcApis).map((name) => {
        return t.importSpecifier(t.identifier(name), t.identifier(name));
    });

    return t.importDeclaration(imports, t.literal(LWC_MODULE_NAME));
}

export function format(
    templateFn: t.FunctionDeclaration,
    state: State,
    codeGen: CodeGen
): t.Program {
    codeGen.usedLwcApis.add(SECURE_REGISTER_TEMPLATE_METHOD_NAME);

    const imports = [...generateComponentImports(codeGen), generateLwcApisImport(codeGen)];

    const metadata = generateTemplateMetadata(state, codeGen);

    const templateBody = [
        templateFn,
        t.exportDefaultDeclaration(
            t.callExpression(t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME), [
                t.identifier(TEMPLATE_FUNCTION_NAME),
            ])
        ),
    ];

    return t.program([...imports, ...templateBody, ...metadata]);
}
