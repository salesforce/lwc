/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { traverse, type Visitors } from 'estree-toolkit';
import { parse } from 'acorn';
import { produce } from 'immer';
import { getValidatorName, type NodeType, type Validator } from './estree/validators';
import type * as es from 'estree';

/**
 * A pointer to a previous value in the template literal, indicating that the value should be re-used.
 * @see {@linkcode esTemplate}
 */
type Ref = number;

/** Extracts the type being validated from the validator function. */
export type Validated<T> =
    T extends Validator<infer N>
        ? NodeType<N>
        : T extends [Validator<infer N>]
          ? NodeType<N>[]
          : never;

/** A validator, validation opt-out, or reference to previously-used validator. */

type Placeholders =
    | []
    | [Validator<any> | [Validator<any>], ...(Validator<any> | [Validator<any>] | Ref)[]];

/**
 * Converts the validators and refs used in the template to the list of parameters required by the
 * created template function. Removes back references to previous slots from the list.
 */
type ToReplacementParameters<Arr> =
    // `Arr` starts with a back reference -- remove it and recurse on the rest
    Arr extends [Ref, ...infer Rest]
        ? ToReplacementParameters<Rest>
        : // `Arr` starts with a single validator -- add it to the list and recurse on the rest
          Arr extends [infer Head, ...infer Rest]
          ? [Validated<Head>, ...ToReplacementParameters<Rest>]
          : // `Arr` is empty -- return an empty array
            Arr extends []
            ? []
            : never;

const PLACEHOLDER_PREFIX = `__ESTEMPLATE_${Math.random().toString().slice(2)}_PLACEHOLDER__`;

interface TraversalState {
    placeholderToValidator: Map<Ref, Validator<any>>;
    replacementNodes: Array<es.Node | es.Node[] | null>;
}

const getReplacementNode = (
    state: TraversalState,
    placeholderId: string
): es.Node | es.Node[] | null => {
    const key = Number(placeholderId.slice(PLACEHOLDER_PREFIX.length));
    const nodeCount = state.replacementNodes.length;
    if (key >= nodeCount) {
        throw new Error(
            `Cannot use index ${key} when only ${nodeCount} values have been provided.`
        );
    }

    const validateReplacement = state.placeholderToValidator.get(key);
    const replacementNode = state.replacementNodes[key];
    if (
        validateReplacement &&
        !(Array.isArray(replacementNode)
            ? replacementNode.every(validateReplacement)
            : validateReplacement(replacementNode))
    ) {
        const expectedType = getValidatorName(validateReplacement);
        const actualType = Array.isArray(replacementNode)
            ? `[${replacementNode.map((n) => n && n.type).join(', ')}]`
            : replacementNode?.type;
        throw new Error(
            `Validation failed for templated node. Expected type ${expectedType}, but received ${actualType}.`
        );
    }

    return replacementNode;
};

const visitors = {
    Identifier(path, state) {
        if (path.node?.name.startsWith(PLACEHOLDER_PREFIX)) {
            const replacementNode = getReplacementNode(state, path.node.name);

            if (replacementNode === null) {
                path.remove();
            } else if (Array.isArray(replacementNode)) {
                if (replacementNode.length === 0) {
                    path.remove();
                } else {
                    if (path.parentPath?.node?.type === 'ExpressionStatement') {
                        path.parentPath.replaceWithMultiple(replacementNode);
                    } else {
                        path.replaceWithMultiple(replacementNode);
                    }
                }
            } else {
                path.replaceWith(replacementNode);
            }
        }
    },
    Literal(path, state) {
        if (
            typeof path.node?.value === 'string' &&
            path.node.value.startsWith(PLACEHOLDER_PREFIX)
        ) {
            // A literal can only be replaced with a single node
            const replacementNode = getReplacementNode(state, path.node.value) as es.Node;

            path.replaceWith(replacementNode);
        }
    },
} satisfies Visitors<TraversalState>;

type EsTemplate<Placeholders> = <RetType>(
    ...replacementNodes: ToReplacementParameters<Placeholders>
) => RetType;

const esTemplateImpl =
    <N>(wrap = (code: string) => code, unwrap?: (node: N) => es.Statement | es.Statement[]) =>
    <P extends Placeholders>(
        template: TemplateStringsArray,
        ...substitutions: P
    ): EsTemplate<P> => {
        const { parsableCode, placeholderToValidator } = generateParsableTemplate(
            template,
            substitutions
        );

        const originalAstProgram = parse(wrap(parsableCode), {
            ecmaVersion: 2022,
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
            allowSuperOutsideMethod: true,
            allowImportExportEverywhere: true,
            locations: false,
        }) as es.Program;

        const finalCharacter = template.at(-1)?.trimEnd()?.at(-1);

        // Turns Acorn AST objects into POJOs, for use with Immer.
        const originalAst: N = JSON.parse(
            JSON.stringify(extractAstNode(originalAstProgram, finalCharacter))
        );

        return <R>(...replacementNodes: ToReplacementParameters<Placeholders>) => {
            const result = produce(originalAst, (astDraft) =>
                traverse(astDraft, visitors, {
                    placeholderToValidator,
                    replacementNodes,
                })
            );
            return (unwrap ? unwrap(result) : result) as R;
        };
    };

/**
 * Template literal tag that generates a builder function. Like estree's `builders`, but for more
 * complex structures. The template values should be estree `is` validators or a back reference to
 * a previous slot (to re-use the referenced value).
 *
 * To have the generated function return a particular node type, the generic comes _after_ the
 * template literal. Kinda weird, but it's necessary to infer the types of the template values.
 * (If it were at the start, we'd need to explicitly provide _all_ type params. Tedious!)
 * @example
 * const bSum = esTemplate`(${is.identifier}, ${is.identifier}) => ${0} + ${1}`<t.ArrowFunctionExpression>
 * const sumFuncNode = bSum(b.identifier('a'), b.identifier('b'))
 * // `sumFuncNode` is an AST node representing `(a, b) => a + b`
 */
export const esTemplate = esTemplateImpl();

/** Similar to {@linkcode esTemplate}, but supports `yield` expressions. */
export const esTemplateWithYield = esTemplateImpl(
    (code) => `function* placeholder() {${code}}`,
    (node: es.FunctionDeclaration) =>
        node.body.body.length === 1 ? node.body.body[0] : node.body.body
);
function generateParsableTemplate<P extends Placeholders>(
    template: TemplateStringsArray,
    substitutions: P
) {
    let placeholderCount = 0;
    let parsableCode = template[0];
    const placeholderToValidator = new Map<Ref, Validator<any>>();
    // String.raw
    for (let i = 1; i < template.length; i += 1) {
        const segment = template[i];
        const validator = substitutions[i - 1]; // always one less value than strings in template literals

        if (typeof validator !== 'number') {
            // Template slot will be filled by a *new* argument passed to the generated function
            placeholderToValidator.set(
                placeholderCount,
                Array.isArray(validator) ? validator[0] : validator
            );
            parsableCode += `${PLACEHOLDER_PREFIX}${placeholderCount}`;
            placeholderCount += 1;
        } else {
            // Template slot uses a *previously defined* argument passed to the generated function
            if (validator >= placeholderCount) {
                throw new Error(
                    `Reference to argument ${validator} at index ${i} cannot be used. Only ${placeholderCount - 1} arguments have been defined.`
                );
            }
            parsableCode += `${PLACEHOLDER_PREFIX}${validator}`;
        }
        parsableCode += segment;
    }

    return { parsableCode, placeholderToValidator };
}

function extractAstNode(originalAstProgram: es.Program, finalCharacter: string | undefined) {
    if (originalAstProgram.body.length === 1) {
        if (finalCharacter === ';' && originalAstProgram.body[0].type === 'ExpressionStatement') {
            return originalAstProgram.body[0].expression;
        } else {
            return originalAstProgram.body[0];
        }
    } else {
        return originalAstProgram.body;
    }
}
