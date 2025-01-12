/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { traverse, type Visitors, type types as es } from 'estree-toolkit';
import { parse } from 'acorn';
import { produce } from 'immer';
import { getValidatorName, type NodeType, type Validator } from './estree/validators';

/** Placeholder value to use to opt out of validation. */
const NO_VALIDATION = false;

/**
 * A pointer to a previous value in the template literal, indicating that the value should be re-used.
 * @see {@linkcode esTemplate}
 */
type ValidatorReference = number;

/** A validator, validation opt-out, or reference to previously-used validator. */
type ValidatorPlaceholder<T> =
    | Validator<T>
    | [Validator<T>]
    | ValidatorReference
    | typeof NO_VALIDATION;

/** Extracts the type being validated from the validator function. */
type ValidatedType<T> =
    T extends Validator<infer U>
        ? NodeType<U>
        : T extends [Validator<infer U>]
          ? NodeType<U>[]
          : T extends ValidatorReference
            ? never
            : never;

/**
 * Converts the validators and refs used in the template to the list of parameters required by the
 * created template function. Removes back references to previous slots from the list.
 */
type ToReplacementParameters<Arr extends unknown[]> = Arr extends [infer Head, ...infer Rest]
    ? Head extends ValidatorReference
        ? // `Head` is a back reference, drop it from the parameter list
          ToReplacementParameters<Rest>
        : // `Head` is a validator, extract the type that it validates
          [ValidatedType<Head>, ...ToReplacementParameters<Rest>]
    : []; // `Arr` is an empty array -- nothing to transform

const PLACEHOLDER_PREFIX = `__ESTEMPLATE_${Math.random().toString().slice(2)}_PLACEHOLDER__`;

interface TraversalState {
    placeholderToValidator: Map<number, Validator<any>>;
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

const visitors: Visitors<TraversalState> = {
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
};

function esTemplateImpl<Validators extends ValidatorPlaceholder<any>[]>(
    javascriptSegments: TemplateStringsArray,
    validators: Validators,
    wrap?: (code: string) => string,
    unwrap?: (node: any) => es.Statement | es.Statement[]
): <RetType>(...replacementNodes: ToReplacementParameters<Validators>) => RetType {
    let placeholderCount = 0;
    let parsableCode = javascriptSegments[0];
    const placeholderToValidator = new Map<number, Validator<any>>();

    for (let i = 1; i < javascriptSegments.length; i += 1) {
        const segment = javascriptSegments[i];
        const validator = validators[i - 1]; // always one less value than strings in template literals

        if (typeof validator !== 'number') {
            // Template slot will be filled by a *new* argument passed to the generated function
            if (validator !== NO_VALIDATION) {
                placeholderToValidator.set(
                    placeholderCount,
                    Array.isArray(validator) ? validator[0] : validator
                );
            }
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

    if (wrap) {
        parsableCode = wrap(parsableCode);
    }

    const originalAstProgram = parse(parsableCode, {
        ecmaVersion: 2022,
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowImportExportEverywhere: true,
        locations: false,
    }) as es.Node as es.Program;

    let originalAst: es.Node | es.Node[];

    const finalCharacter = javascriptSegments.at(-1)?.trimEnd()?.at(-1);
    if (originalAstProgram.body.length === 1) {
        originalAst =
            finalCharacter === ';' && originalAstProgram.body[0].type === 'ExpressionStatement'
                ? (originalAst = originalAstProgram.body[0].expression)
                : (originalAst = originalAstProgram.body[0]);
    } else {
        originalAst = originalAstProgram.body;
    }

    // Turns Acorn AST objects into POJOs, for use with Immer.
    originalAst = JSON.parse(JSON.stringify(originalAst));

    return function templatedAst<RetType>(
        ...replacementNodes: ToReplacementParameters<Validators>
    ): RetType {
        const result = produce(originalAst, (astDraft) =>
            traverse(astDraft, visitors, {
                placeholderToValidator,
                replacementNodes,
            })
        );
        return (unwrap ? unwrap(result) : result) as RetType;
    };
}

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
export function esTemplate<Validators extends ValidatorPlaceholder<any>[]>(
    javascriptSegments: TemplateStringsArray,
    ...validators: Validators
): <RetType>(...replacementNodes: ToReplacementParameters<Validators>) => RetType {
    return esTemplateImpl(javascriptSegments, validators);
}

/** Similar to {@linkcode esTemplate}, but supports `yield` expressions. */
export function esTemplateWithYield<Validators extends ValidatorPlaceholder<any>[]>(
    javascriptSegments: TemplateStringsArray,
    ...validators: Validators
): <RetType>(...replacementNodes: ToReplacementParameters<Validators>) => RetType {
    const wrap = (code: string) => `function* placeholder() {${code}}`;
    const unwrap = (node: es.FunctionDeclaration) =>
        node.body.body.length === 1 ? node.body.body[0] : node.body.body;

    return esTemplateImpl(javascriptSegments, validators, wrap, unwrap) as <RetType>(
        ...replacementNodes: ToReplacementParameters<Validators>
    ) => RetType;
}
