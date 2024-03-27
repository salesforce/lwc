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
    HTML_NAMESPACE,
    isAPIFeatureEnabled,
    isArray,
    isNull,
    isUndefined,
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
    isExpression,
    isStringLiteral,
    isText,
} from '../shared/ast';
import { STATIC_SAFE_DIRECTIVES } from '../shared/constants';
import {
    isAllowedFragOnlyUrlsXHTML,
    isFragmentOnlyUrl,
    isIdReferencingAttribute,
    isSvgUseHref,
} from '../parser/attribute';
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
    const { name: nodeName, namespace = '', attributes, directives, properties } = node;

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

    // all attrs are static-safe
    // the criteria to determine safety can be found in computeAttrValue
    result &&= attributes.every(({ name, value }) => {
        const isStaticSafeLiteral =
            isLiteral(value) &&
            name !== 'slot' &&
            // check for ScopedId
            name !== 'id' &&
            name !== 'spellcheck' && // spellcheck is specially handled by the vnodes.
            !isIdReferencingAttribute(name) &&
            // svg href needs sanitization.
            !isSvgUseHref(nodeName, name, namespace) &&
            // Check for ScopedFragId
            !(
                isAllowedFragOnlyUrlsXHTML(nodeName, name, namespace) &&
                isFragmentOnlyUrl(value.value as string)
            );
        const isStaticSafeExpression =
            isExpression(value) &&
            name !== 'slot' &&
            // TODO [#3624]: Revisit whether svgs can be included in static content optimization
            // svg href needs sanitization.
            !isSvgUseHref(nodeName, name, namespace);
        return isStaticSafeLiteral || isStaticSafeExpression;
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
            hasDynamicText ||= isText(childNode) && !isStringLiteral(childNode.value);
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

// The purpose of this function is to concatenate the contiguous text nodes into a single array
// to simplify the traversing logic when generating static parts and serializing the element.
export function transformStaticChildren(elm: StaticElement) {
    const children = elm.children;
    if (!children.length || !STATIC_ELEMENT_WITH_DYNAMIC_TEXT_SET.has(elm)) {
        // The element either has no children or its children does not contain dynamic text.
        return children;
    }

    if (STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.has(elm)) {
        return STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.get(elm)!;
    }

    const result: (StaticChildNode | Text[])[] = [];
    const len = children.length;

    let current: StaticChildNode;
    let next: StaticChildNode;
    let contiguousTextNodes: Text[] | null = null;

    for (let i = 0; i < len; i++) {
        current = children[i];
        if (!isText(current)) {
            contiguousTextNodes = null;
            result.push(current);
        } else {
            if (!isNull(contiguousTextNodes)) {
                // Already in a contiguous text node chain
                // All contiguous nodes represent an expression in the source, it's guaranteed by the parser.
                contiguousTextNodes.push(current);
            } else {
                next = children[i + 1];
                if (isExpression(current) || (!isUndefined(next) && isText(next))) {
                    // Text nodes can appear as follows:
                    // 1. A single text literal node.
                    // 2. A single text expression node.
                    // 3. Contiguous series of text nodes (literal/expression mixed) with at least 1 expression.
                    // When there is an expression in the source, the text nodes are split into contiguous text nodes.
                    // When there is no expression in the source, the text will appear as a single text literal.
                    // We normalize all of the contiguous text nodes or single text expression to an array.
                    // Single text literal nodes (no expression or are not part of a contiguous set of text nodes) remain text nodes
                    // and will not be consolidated to an array.
                    // This is to normalize the traversal behavior when creating static parts and when serializing
                    // the elements.
                    contiguousTextNodes = [current];
                }
                // When contiguousTextNodes is null it is a single string literal.
                result.push(contiguousTextNodes ?? current);
            }
        }
    }

    STATIC_ELEMENT_TO_DYNAMIC_TEXT_CHILDREN_CACHE.set(elm, result);

    return result;
}

// Dynamic text is consolidated from individual text arrays into a single Text[].
// Static text = a single text literal node (not in an array).
// Dynamic text = At least 1 text expression node + 0 or more text literal nodes (always in an array).
export const isDynamicText = (nodes: StaticChildNode | StaticChildNode[]): nodes is Text[] =>
    isArray(nodes) && ArrayEvery.call(nodes, isText);
