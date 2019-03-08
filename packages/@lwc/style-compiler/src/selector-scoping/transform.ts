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

import validateSelectors from './validate';

import { isDirPseudoClass } from '../utils/rtl';
import { SHADOW_ATTRIBUTE, HOST_ATTRIBUTE } from '../utils/selectors-scoping';
import { findNode, replaceNodeWith, trimNodeWhitespaces } from '../utils/selector-parser';

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
    const compoundSelectors: Node[][] = [[]];

    // Split the selector per compound selector. Compound selectors are interleaved with combinator nodes.
    // https://drafts.csswg.org/selectors-4/#typedef-complex-selector
    selector.each(node => {
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
            let nodeToScope: Node | undefined;

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
                selector.insertBefore(compoundSelector[0], shadowAttribute);
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
    const hostNode = findNode(selector, isHostPseudoClass) as Pseudo | undefined;

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
        const contextualSelectors = hostNode.nodes.map((contextSelectors: Selector) => {
            const clonedSelector = selector.clone({}) as Selector;
            const clonedHostNode = clonedSelector.at(hostIndex) as Tag;

            // Add to the compound selector previously containing the :host pseudo class
            // the contextual selectors.
            contextSelectors.each(node => {
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

    root.each((selector: Selector) => {
        scopeSelector(selector);
    });

    if (transformConfig.transformHost) {
        root.each((selector: Selector) => {
            transformHost(selector);
        });
    }
}
