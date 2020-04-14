/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as t from '@babel/types';

import State from '../../state';
import {
    identifierFromComponentName,
    generateTemplateMetadata,
    kebabcaseToCamelcase,
} from '../helpers';

import {
    TEMPLATE_FUNCTION_NAME,
    SECURE_REGISTER_TEMPLATE_METHOD_NAME,
    LWC_MODULE_NAME,
} from '../../shared/constants';

function moduleNameToImport(name: string): t.ImportDeclaration {
    const localIdentifier = identifierFromComponentName(name);

    return t.importDeclaration(
        [t.importDefaultSpecifier(localIdentifier)],
        t.stringLiteral(kebabcaseToCamelcase(name))
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
        t.stringLiteral(LWC_MODULE_NAME)
    );
}

function generateInlineStylesImports(state: State) {
    return state.inlineStyle.imports;
}

export function format(templateFn: t.FunctionDeclaration, state: State): t.Program {
    const imports = state.dependencies.map((cmpClassName) => moduleNameToImport(cmpClassName));

    const metadata = generateTemplateMetadata(state);

    imports.push(generateSecureImports(state.secureDependencies));
    imports.push(...generateInlineStylesImports(state));

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
