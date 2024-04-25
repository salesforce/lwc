/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { traverse, Visitors } from 'estree-toolkit';
import { parse } from 'acorn';
import { produce } from 'immer';
import type { Node, Program, FunctionDeclaration } from 'estree';

export const placeholder = false;

type ReturnsBool = (node: Node | null) => boolean;
export type Validator = ReturnsBool | typeof placeholder;

const PLACEHOLDER_PREFIX = `__ESTEMPLATE_${Math.random().toString().slice(2)}_PLACEHOLDER__`;

interface TraversalState {
    placeholderToValidator: Map<string, Validator>;
    replacementNodes: (Node | Node[] | null)[];
}

const visitors: Visitors<TraversalState> = {
    Identifier(path, state) {
        if (path.node?.name.startsWith(PLACEHOLDER_PREFIX)) {
            const key = path.node.name.slice(PLACEHOLDER_PREFIX.length);
            const validateReplacement = state.placeholderToValidator.get(key)!;
            const replacementNode = state.replacementNodes[key as unknown as number];

            if (
                validateReplacement &&
                !(Array.isArray(replacementNode)
                    ? replacementNode.every(validateReplacement)
                    : validateReplacement(replacementNode))
            ) {
                throw new Error(`Validation failed for templated node of type ${path.node.type}`);
            }

            if (replacementNode === null) {
                path.remove();
            } else if (Array.isArray(replacementNode)) {
                if (replacementNode.length === 0) {
                    path.remove();
                } else {
                    if (path.parentPath!.node!.type === 'ExpressionStatement') {
                        path.parentPath!.replaceWithMultiple(replacementNode);
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
            const key = path.node.value.slice(PLACEHOLDER_PREFIX.length);
            const validateReplacement = state.placeholderToValidator.get(key)!;
            const replacementNode = state.replacementNodes[key as unknown as number] as Node;

            if (validateReplacement && !validateReplacement(replacementNode)) {
                throw new Error(`Validation failed for templated node of type ${path.node.type}`);
            }

            path.replaceWith(replacementNode);
        }
    },
};

function esTemplateImpl<
    ReturnType = Node,
    ArgTypes extends (Node | Node[] | null)[] = (Node | Node[] | null)[]
>(
    javascriptSegments: TemplateStringsArray,
    validatorFns: Validator[],
    wrap?: (code: string) => string,
    unwrap?: (node: ReturnType) => any
): (...replacementNodes: ArgTypes) => ReturnType {
    let placeholderCount = 0;
    let parsableCode = javascriptSegments[0];
    validatorFns.reverse();
    const placeholderToValidator = new Map<string, ReturnsBool>();

    for (const segment of javascriptSegments.slice(1)) {
        const validatorFn = validatorFns.pop();
        if (validatorFn) {
            placeholderToValidator.set(placeholderCount.toString(), validatorFn);
        }
        parsableCode += `${PLACEHOLDER_PREFIX}${placeholderCount++}`;
        parsableCode += segment;
    }

    if (wrap) {
        parsableCode = wrap(parsableCode);
    }

    let originalAst = parse(parsableCode, {
        ecmaVersion: 2022,
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowImportExportEverywhere: true,
        locations: false,
    }) as Node;

    const originalAstProgram = originalAst as Program;
    const finalCharacter = javascriptSegments.at(-1)?.trimEnd()?.at(-1);
    if (
        originalAstProgram.body.length === 1 &&
        originalAstProgram.body[0].type === 'ExpressionStatement' &&
        finalCharacter !== ';'
    ) {
        originalAst = originalAstProgram.body[0].expression;
    } else {
        originalAst = originalAstProgram.body[0];
    }

    // Turns Acorn AST objects into POJOs, for use with Immer.
    originalAst = JSON.parse(JSON.stringify(originalAst));

    return function templatedAst(...replacementNodes: ArgTypes): ReturnType {
        const result = produce(originalAst, (astDraft) =>
            traverse(astDraft, visitors, {
                placeholderToValidator,
                replacementNodes,
            })
        ) as ReturnType;
        return unwrap ? unwrap(result) : result;
    };
}

export function esTemplate<
    ReturnType = Node,
    ArgTypes extends (Node | Node[] | null)[] = (Node | Node[] | null)[]
>(
    javascriptSegments: TemplateStringsArray,
    ...validatorFns: Validator[]
): (...replacementNodes: ArgTypes) => ReturnType {
    return esTemplateImpl(javascriptSegments, validatorFns);
}

export function esTemplateWithYield<
    ReturnType = Node,
    ArgTypes extends (Node | Node[] | null)[] = (Node | Node[] | null)[]
>(
    javascriptSegments: TemplateStringsArray,
    ...validatorFns: Validator[]
): (...replacementNodes: ArgTypes) => ReturnType {
    const wrap = (code: string) => `function* placeholder() {${code}}`;
    const unwrap = (node: FunctionDeclaration) =>
        node.body.body.length === 1
            ? (node.body.body[0] as ReturnType)
            : (node.body.body as ReturnType);

    return esTemplateImpl<FunctionDeclaration>(
        javascriptSegments,
        validatorFns,
        wrap,
        unwrap
    ) as unknown as (...replacementNodes: ArgTypes) => ReturnType;
}
