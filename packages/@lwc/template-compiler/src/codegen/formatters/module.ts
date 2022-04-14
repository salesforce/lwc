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
import { optimizeStaticExpressions } from '../optimize';

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
    const imports = Array.from(codeGen.usedLwcApis)
        .sort()
        .map((name) => {
            return t.importSpecifier(t.identifier(name), t.identifier(name));
        });

    return t.importDeclaration(imports, t.literal(LWC_MODULE_NAME));
}

function generateHoistedNodes(codegen: CodeGen): t.VariableDeclaration[] {
    return codegen.hoistedNodes.map(({ identifier, expr }) => {
        return t.variableDeclaration('const', [t.variableDeclarator(identifier, expr)]);
    });
}

/**
 * Generate an ES module AST from a template ESTree AST. The generated module imports the dependent
 * LWC components via import statements and expose the template function via a default export
 * statement.
 *
 * @example
 * ```js
 * import { registerTemplate } from 'lwc';
 * // Components imports
 *
 * function tmpl() {
 *   // Template generated code
 * }
 * // Template metadata
 *
 * export default tmpl;
 * registerTemplate(tmpl);
 * ```
 */
export function format(templateFn: t.FunctionDeclaration, codeGen: CodeGen): t.Program {
    codeGen.usedLwcApis.add(SECURE_REGISTER_TEMPLATE_METHOD_NAME);

    const imports = [...generateComponentImports(codeGen), generateLwcApisImport(codeGen)];
    const hoistedNodes = generateHoistedNodes(codeGen);

    const metadata = generateTemplateMetadata(codeGen);

    const optimizedTemplateDeclarations = optimizeStaticExpressions(templateFn);

    const templateBody = [
        ...optimizedTemplateDeclarations,
        t.exportDefaultDeclaration(
            t.callExpression(t.identifier(SECURE_REGISTER_TEMPLATE_METHOD_NAME), [
                t.identifier(TEMPLATE_FUNCTION_NAME),
            ])
        ),
    ];

    return t.program([...imports, ...hoistedNodes, ...templateBody, ...metadata]);
}
