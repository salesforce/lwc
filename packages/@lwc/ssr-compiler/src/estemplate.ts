/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { traverse, Visitors } from 'estree-toolkit';
import { parse } from 'acorn';
import { produce } from 'immer';
import type {
    Node as EsNode,
    Program as EsProgram,
    FunctionDeclaration as EsFunctionDeclaration,
} from 'estree';

export const placeholder = false;
type ReplacementNode = EsNode | EsNode[] | null;

type ReturnsBool = (node: EsNode | null) => boolean;
export type Validator = ReturnsBool | typeof placeholder;

const PLACEHOLDER_PREFIX = `__ESTEMPLATE_${Math.random().toString().slice(2)}_PLACEHOLDER__`;

interface TraversalState {
    placeholderToValidator: Map<string, Validator>;
    replacementNodes: ReplacementNode[];
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
            const replacementNode = state.replacementNodes[key as unknown as number] as EsNode;

            if (validateReplacement && !validateReplacement(replacementNode)) {
                throw new Error(`Validation failed for templated node of type ${path.node.type}`);
            }

            path.replaceWith(replacementNode);
        }
    },
};

function esTemplateImpl<RetType = EsNode, ArgTypes extends ReplacementNode[] = ReplacementNode[]>(
    javascriptSegments: TemplateStringsArray,
    validatorFns: Validator[],
    wrap?: (code: string) => string,
    unwrap?: (node: RetType) => any
): (...replacementNodes: ArgTypes) => RetType {
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

    const originalAstProgram = parse(parsableCode, {
        ecmaVersion: 2022,
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowImportExportEverywhere: true,
        locations: false,
    }) as EsNode as EsProgram;

    let originalAst: EsNode | EsNode[];

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

    return function templatedAst(...replacementNodes: ArgTypes): RetType {
        const result = produce(originalAst, (astDraft) =>
            traverse(astDraft, visitors, {
                placeholderToValidator,
                replacementNodes,
            })
        ) as RetType;
        return unwrap ? unwrap(result) : result;
    };
}

export function esTemplate<
    RetType = EsNode,
    ArgTypes extends ReplacementNode[] = ReplacementNode[],
>(
    javascriptSegments: TemplateStringsArray,
    ...validatorFns: Validator[]
): (...replacementNodes: ArgTypes) => RetType {
    return esTemplateImpl(javascriptSegments, validatorFns);
}

export function esTemplateWithYield<
    RetType = EsNode,
    ArgTypes extends ReplacementNode[] = ReplacementNode[],
>(
    javascriptSegments: TemplateStringsArray,
    ...validatorFns: Validator[]
): (...replacementNodes: ArgTypes) => RetType {
    const wrap = (code: string) => `function* placeholder() {${code}}`;
    const unwrap = (node: EsFunctionDeclaration) =>
        node.body.body.length === 1 ? (node.body.body[0] as RetType) : (node.body.body as RetType);

    return esTemplateImpl<EsFunctionDeclaration>(
        javascriptSegments,
        validatorFns,
        wrap,
        unwrap
    ) as unknown as (...replacementNodes: ArgTypes) => RetType;
}
