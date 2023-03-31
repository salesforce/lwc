/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isPseudoElement,
    isCombinator,
    isPseudoClass,
    Selector,
    Root,
    Node,
    Pseudo,
    Tag,
    attribute,
} from 'postcss-selector-parser';

import { isDirPseudoClass } from '../utils/rtl';
import { SHADOW_ATTRIBUTE, HOST_ATTRIBUTE } from '../utils/selectors-scoping';
import { findNode, replaceNodeWith, trimNodeWhitespaces } from '../utils/selector-parser';

import validateSelectors from './validate';

type ChildNode = Exclude<Node, Selector>;

export interface SelectorScopingConfig {
    /** When set to true, the :host selector gets replace with the the scoping token. */
    transformHost: boolean;
}

function isHostPseudoClass(node: Node): node is Pseudo {
    return isPseudoClass(node) && node.value === ':host';
}

/**
 * Add scoping attributes to all the matching selectors:
 *   h1 -> h1[x-foo_tmpl]
 *   p a -> p[x-foo_tmpl] a[x-foo_tmpl]
 */
function scopeSelector(selector: Selector) {
    const compoundSelectors: ChildNode[][] = [[]];

    // Split the selector per compound selector. Compound selectors are interleaved with combinator nodes.
    // https://drafts.csswg.org/selectors-4/#typedef-complex-selector
    selector.each((node) => {
        if (isCombinator(node)) {
            compoundSelectors.push([]);
        } else {
            const current = compoundSelectors[compoundSelectors.length - 1];
            current.push(node);
        }
    });

    for (const compoundSelector of compoundSelectors) {
        // Compound selectors with only a single :dir pseudo class should be scoped, the dir pseudo
        // class transform will take care of transforming it properly.
        const containsSingleDirSelector =
            compoundSelector.length === 1 && isDirPseudoClass(compoundSelector[0]);

        // Compound selectors containing :host have a special treatment and should not be scoped
        // like the rest of the complex selectors.
        const containsHost = compoundSelector.some(isHostPseudoClass);

        if (!containsSingleDirSelector && !containsHost) {
            let nodeToScope: ChildNode | undefined;

            // In each compound selector we need to locate the last selector to scope.
            for (const node of compoundSelector) {
                if (!isPseudoElement(node)) {
                    nodeToScope = node;
                }
            }

            const shadowAttribute = attribute({
                attribute: SHADOW_ATTRIBUTE,
                value: undefined,
                raws: {},
            });

            if (nodeToScope) {
                // Add the scoping attribute right after the node scope
                selector.insertAfter(nodeToScope, shadowAttribute);
            } else {
                // Add the scoping token in the first position of the compound selector as a fallback
                // when there is no node to scope. For example: ::after {}
                const [firstSelector] = compoundSelector;
                selector.insertBefore(firstSelector, shadowAttribute);
                // Move any whitespace before the selector (e.g. "  ::after") to before the shadow attribute,
                // so that the resulting selector is correct (e.g. "  [attr]::after", not "[attr]  ::after")
                if (firstSelector && firstSelector.spaces.before) {
                    shadowAttribute.spaces.before = firstSelector.spaces.before;
                    const clonedFirstSelector = firstSelector.clone({});
                    clonedFirstSelector.spaces.before = '';
                    firstSelector.replaceWith(clonedFirstSelector);
                }
            }
        }
    }
}

/**
 * Mark the :host selector with a placeholder. If the selector has a list of
 * contextual selector it will generate a rule for each of them.
 *   :host -> [x-foo_tmpl-host]
 *   :host(.foo, .bar) -> [x-foo_tmpl-host].foo, [x-foo_tmpl-host].bar
 */
function transformHost(selector: Selector) {
    // Locate the first :host pseudo-class
    const hostNode = findNode(selector, isHostPseudoClass);

    if (hostNode) {
        // Store the original location of the :host in the selector
        const hostIndex = selector.index(hostNode);

        // Swap the :host pseudo-class with the host scoping token
        const hostAttribute = attribute({
            attribute: HOST_ATTRIBUTE,
            value: undefined,
            raws: {},
        });
        hostNode.replaceWith(hostAttribute);

        // Generate a unique contextualized version of the selector for each selector pass as argument
        // to the :host
        const contextualSelectors = hostNode.nodes.map((contextSelectors) => {
            const clonedSelector = selector.clone({}) as Selector;
            const clonedHostNode = clonedSelector.at(hostIndex) as Tag;

            // Add to the compound selector previously containing the :host pseudo class
            // the contextual selectors.
            (contextSelectors as Selector).each((node) => {
                trimNodeWhitespaces(node);
                clonedSelector.insertAfter(clonedHostNode, node);
            });

            return clonedSelector;
        });

        // Replace the current selector with the different variants
        replaceNodeWith(selector, ...contextualSelectors);
    }
}

export default function transformSelector(root: Root, transformConfig: SelectorScopingConfig) {
    validateSelectors(root);

    root.each(scopeSelector);

    if (transformConfig.transformHost) {
        root.each(transformHost);
    }
}
