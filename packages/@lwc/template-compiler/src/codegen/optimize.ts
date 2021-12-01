import * as astring from 'astring';
import { walk } from 'estree-walker';
import * as t from '../shared/estree';

/**
 * Given a template function, extract all static objects/arrays (e.g. { key : 1 })
 * and return them as a list of `const` declarations. Also return the modified function
 * that is now referencing those declarations.
 * E.g. input: `function tmpl() { return { foo: 'bar' }; }`
 *      output: `const static1 = { foo: 'bar' }; function tmpl() { return static1; }`
 */
export function optimizeStaticObjects(
    templateFn: t.FunctionDeclaration
): Array<t.FunctionDeclaration | t.VariableDeclaration> {
    const result: Array<t.FunctionDeclaration | t.VariableDeclaration> = [];
    const keysToVariableNames = new Map();

    let identifierCount = 0;

    function isStaticObjectOrArray(node: t.BaseNode): boolean {
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
                return (
                    element !== null &&
                    t.isExpression(element) &&
                    (t.isLiteral(element) || isStaticObjectOrArray(element))
                );
            });
        }
        return false;
    }

    function extractStaticVariable(node: t.BaseNode): t.BaseNode {
        // This key generation can probably be improved using a hash code, but stringification is
        // simplest for finding a unique identifier for an object/array expression
        const key = astring.generate(node);

        // Check for duplicates to avoid redeclaring the same object/array multiple times
        // Especially for the empty array (`[]`), which is very common in templates
        if (!keysToVariableNames.has(key)) {
            const variableName = `stc${identifierCount++}`;
            // e.g. `const stc0 = { /* original object */ };
            const declaration = t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.identifier(variableName),
                    node as t.ArrayExpression | t.ObjectExpression
                ),
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
