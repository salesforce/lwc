/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as astring from 'astring';
import { walk } from 'estree-walker';
import * as t from '../shared/estree';

/**
 * Given a template function, extract all static objects/arrays (e.g. `{ key : 1 }`)
 * and return them as a list of `const` declarations. Also return the modified function
 * that is now referencing those declarations.
 *
 * Example input:
 *
 * ```
 * function tmpl() {
 *   return {
 *     foo: dynamic(),
 *     bar: { static: true },
 *     baz: { really: { static: ['yep', 'totally', 'static' ] } }
 *   };
 * }
 * ```
 *
 * Example output:
 *
 * ```
 * const stc0 = { static: true };
 * const stc1 = { really: { static: ['yep', 'totally', 'static' ] } };
 * function tmpl() {
 *   return {
 *     foo: dynamic(),
 *     bar: stc0,
 *     baz: stc1
 *   };
 * }
 * ```
 */
export function optimizeStaticExpressions(
    templateFn: t.FunctionDeclaration
): Array<t.FunctionDeclaration | t.VariableDeclaration> {
    const result: Array<t.FunctionDeclaration | t.VariableDeclaration> = [];
    const keysToVariableNames = new Map();

    // Return true if this node is an object/array that is fully static
    function isStaticObjectOrArray(
        node: t.BaseNode
    ): node is t.ObjectExpression | t.ArrayExpression {
        if (t.isObjectExpression(node)) {
            return node.properties.every((prop) => {
                return (
                    t.isProperty(prop) &&
                    !prop.computed &&
                    !prop.method &&
                    !prop.shorthand &&
                    (t.isLiteral(prop.value) || isStaticObjectOrArray(prop.value))
                );
            });
        } else if (t.isArrayExpression(node)) {
            return node.elements.every((element) => {
                return element !== null && (t.isLiteral(element) || isStaticObjectOrArray(element));
            });
        }
        return false;
    }

    function extractStaticVariable(node: t.ObjectExpression | t.ArrayExpression): t.Identifier {
        // This key generation can probably be improved using a hash code, but stringification is
        // simplest for finding a unique identifier for an object/array expression
        const key = astring.generate(node);

        // Check for duplicates to avoid re-declaring the same object/array multiple times
        // Especially for the empty array (`[]`), which is very common in templates
        if (!keysToVariableNames.has(key)) {
            const variableName = `stc${keysToVariableNames.size}`;
            // e.g. `const stc0 = { /* original object */ };
            const declaration = t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(variableName), node),
            ]);
            result.push(declaration);
            keysToVariableNames.set(key, variableName);
        }

        return t.identifier(keysToVariableNames.get(key));
    }

    walk(templateFn, {
        enter(node) {
            // For deeply-nested static object, we only want to extract the top-level node
            if (isStaticObjectOrArray(node)) {
                const newNode = extractStaticVariable(node);
                this.replace(newNode);
                this.skip();
            }
        },
    });

    result.push(templateFn);

    return result;
}
