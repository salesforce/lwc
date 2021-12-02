/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import * as t from '../../shared/estree';
import { TEMPLATE_FUNCTION_NAME, TEMPLATE_MODULES_PARAMETER } from '../../shared/constants';

import CodeGen from '../codegen';
import { identifierFromComponentName, generateTemplateMetadata } from '../helpers';
import { optimizeStaticExpressions } from '../optimize';

/**
 * Generate a function body AST from a template ESTree AST. This function can then be instantiated
 * via `new Function(code, modules)` The generated function retrieves receives the dependent LWC
 * components as arguments and returns the template function.
 *
 * @example
 * ```js
 * const {
 *   // Components names
 * } = modules;
 *
 * function tmpl() {
 *   // Template generated code
 * }
 * // Template metadata
 *
 * return tmpl;
 * ```
 */
export function format(templateFn: t.FunctionDeclaration, codeGen: CodeGen): t.Program {
    const lookups = Array.from(codeGen.referencedComponents)
        .sort()
        .map((name) => {
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

    const optimizedTemplateDeclarations = optimizeStaticExpressions(templateFn);

    const metadata = generateTemplateMetadata(codeGen);

    return t.program([
        ...lookups,
        ...optimizedTemplateDeclarations,
        ...metadata,
        t.returnStatement(t.identifier(TEMPLATE_FUNCTION_NAME)),
    ]);
}
