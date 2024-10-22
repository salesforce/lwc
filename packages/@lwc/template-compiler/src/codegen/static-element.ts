/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    APIFeature,
    APIVersion,
    ArrayEvery,
    ArraySome,
    HTML_NAMESPACE,
    isAPIFeatureEnabled,
    isArray,
    isNull,
} from '@lwc/shared';
import { isLiteral } from '../shared/estree';
import {
    BaseElement,
    ChildNode,
    Root,
    StaticElement,
    StaticChildNode,
    Text,
} from '../shared/types';
import {
    isBaseElement,
    isComment,
    isConditionalParentBlock,
    isElement,
    isStringLiteral,
    isText,
} from '../shared/ast';
import { STATIC_SAFE_DIRECTIVES } from '../shared/constants';
import State from '../state';
import { isCustomRendererHookRequired } from '../shared/renderer-hooks';

// This set keeps track of static safe elements that have dynamic text in their direct children.
const STATIC_ELEMENT_WITH_DYNAMIC_TEXT_SET = new WeakSet<StaticElement>();

// This map keeps track of static safe elements to their transformed children.
// The children are transformed so that contiguous text nodes are consolidated into arrays.
const STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE = new WeakMap<
    StaticElement,
    (StaticChildNode | Text[])[]
>();

function isStaticNode(node: BaseElement, apiVersion: APIVersion): boolean {
    let result = true;
    const { namespace = '', attributes, directives, properties } = node;

    // SVG is excluded from static content optimization in older API versions due to issues with case sensitivity
    // in CSS scope tokens. See https://github.com/salesforce/lwc/issues/3313
    if (
        !isAPIFeatureEnabled(APIFeature.LOWERCASE_SCOPE_TOKENS, apiVersion) &&
        namespace !== HTML_NAMESPACE
    ) {
        return false;
    }

    // it is an element
    result &&= isElement(node);

    // See W-17015807
    result &&= node.name !== 'iframe';

    // all attrs are static-safe
    // the criteria to determine safety can be found in computeAttrValue
    result &&= attributes.every(({ name }) => {
        // Slots are not safe because the VDOM handles them specially in synthetic shadow and light DOM mode
        // TODO [#4351]: `disableSyntheticShadowSupport` should allow slots to be static-optimized
        return name !== 'slot';
    });

    // all directives are static-safe
    result &&= !directives.some((directive) => !STATIC_SAFE_DIRECTIVES.has(directive.name));

    // all properties are static
    result &&= properties.every((prop) => isLiteral(prop.value));

    return result;
}

function collectStaticNodes(node: ChildNode, staticNodes: Set<ChildNode>, state: State) {
    let childrenAreStaticSafe = true;
    let nodeIsStaticSafe;

    if (isText(node)) {
        nodeIsStaticSafe = true;
    } else if (isComment(node)) {
        nodeIsStaticSafe = true;
    } else {
        let hasDynamicText = false;
        // it is ElseBlock | ForBlock | If | BaseElement
        node.children.forEach((childNode) => {
            collectStaticNodes(childNode, staticNodes, state);

            childrenAreStaticSafe &&= staticNodes.has(childNode);
            // Collect nodes that have dynamic text ahead of time.
            // We only need to know if the direct child has dynamic text.
            hasDynamicText ||= isTextExpression(childNode);
        });

        // for IfBlock and ElseifBlock, traverse down the else branch
        if (isConditionalParentBlock(node) && node.else) {
            collectStaticNodes(node.else, staticNodes, state);
        }

        nodeIsStaticSafe =
            isBaseElement(node) &&
            !isCustomRendererHookRequired(node, state) &&
            isStaticNode(node, state.config.apiVersion);

        if (nodeIsStaticSafe && hasDynamicText) {
            // Track when the static element contains dynamic text.
            // This will alter the way the children need to be traversed to apply static parts.
            // See transformStaticChildren below.
            STATIC_ELEMENT_WITH_DYNAMIC_TEXT_SET.add(node as StaticElement);
        }
    }

    if (nodeIsStaticSafe && childrenAreStaticSafe) {
        staticNodes.add(node);
    }
}

export function getStaticNodes(root: Root, state: State): Set<ChildNode> {
    const staticNodes = new Set<ChildNode>();

    root.children.forEach((childNode) => {
        collectStaticNodes(childNode, staticNodes, state);
    });

    return staticNodes;
}

// The purpose of this function is to concatenate contiguous text nodes into a single array
// to simplify the traversing logic when generating static parts and serializing the element.
// Note, comments that are adjacent to text nodes are ignored when preserveComments is false,
// ex: <span>{dynamic}<!-- comment -->text</span>
// preserveComments = false => [[text, text]]
// preserveComments = true => [[text], comment, [text]]
export function transformStaticChildren(elm: StaticElement, preserveComments: boolean) {
    const children = elm.children;
    if (!children.length || !STATIC_ELEMENT_WITH_DYNAMIC_TEXT_SET.has(elm)) {
        // The element either has no children or its children does not contain dynamic text.
        return children;
    }

    if (STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.has(elm)) {
        // This will be hit by serializeStaticElement
        return STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.get(elm)!;
    }

    const result: (StaticChildNode | Text[])[] = [];
    const len = children.length;

    let current: StaticChildNode;
    let contiguousTextNodes: Text[] | null = null;

    for (let i = 0; i < len; i++) {
        current = children[i];
        if (isText(current)) {
            if (!isNull(contiguousTextNodes)) {
                // Already in a contiguous text node chain
                // All contiguous nodes represent an expression in the source, it's guaranteed by the parser.
                contiguousTextNodes.push(current);
            } else {
                // First time seeing a contiguous text chain
                contiguousTextNodes = [current];
                result.push(contiguousTextNodes);
            }
        } else {
            // Non-text nodes signal the end of contiguous text node chain
            if (!isComment(current) || preserveComments) {
                // Ignore comment nodes when preserveComments is false
                contiguousTextNodes = null;
                result.push(current);
            }
        }
    }

    STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.set(elm, result);

    return result;
}

// Given a static child, determines wether the child is a contiguous text node.
// Note this is intended to be used with children generated from transformStaticChildren
export const isContiguousText = (staticChild: StaticChildNode | Text[]): staticChild is Text[] =>
    isArray(staticChild) && ArrayEvery.call(staticChild, isText);

export const isTextExpression = (node: ChildNode) => isText(node) && !isStringLiteral(node.value);

export const hasDynamicText = (nodes: Text[]) => ArraySome.call(nodes, isTextExpression);
