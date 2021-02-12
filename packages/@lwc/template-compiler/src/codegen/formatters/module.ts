/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import State from '../../state';

import * as t from '../../shared/estree';
import { kebabcaseToCamelcase } from '../../shared/naming';
import {
    TEMPLATE_FUNCTION_NAME,
    SECURE_REGISTER_TEMPLATE_METHOD_NAME,
    LWC_MODULE_NAME,
} from '../../shared/constants';

import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';

function moduleNameToImport(name: string): t.ImportDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localIdentifier)],
        t.literal(kebabcaseToCamelcase(name))
    );
}

function generateSecureImports(additionalImports: string[]): t.ImportDeclaration {
    const imports = additionalImports.map((additionalImport) => {
        return t.importSpecifier(t.identifier(additionalImport), t.identifier(additionalImport));
    });

    return t.importDeclaration(
        [
            t.importSpecifier(
                t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME),
                t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME)
            ),
            ...imports,
        ],
        t.literal(LWC_MODULE_NAME)
    );
}

export function format(templateFn: t.FunctionDeclaration, state: State): t.Program {
    const imports = [
        ...state.dependencies.map((cmpClassName) => moduleNameToImport(cmpClassName)),
        generateSecureImports(state.secureDependencies),
    ];

    const metadata = generateTemplateMetadata(state);

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
