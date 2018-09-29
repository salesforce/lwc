/* tslint:disable:no-duplicate-imports */

import {
    attribute,
    isTag,
    isPseudoElement,
    isCombinator,
    Selector,
    Root,
    Node,
    Pseudo,
    Tag,
} from 'postcss-selector-parser';

import validateSelectors from './validate';
import {
    isCustomElement,
    findNode,
    replaceNodeWith,
    trimNodeWhitespaces,
    isHostPseudoClass,
} from './utils';
import { PluginConfig } from '../config';

export interface SelectorScopingConfig {
    /** When set to true, the :host selector gets replace with the the scoping token. */
    transformHost: boolean;
}

const CUSTOM_ELEMENT_SELECTOR_PREFIX = '$CUSTOM$';

/** Generate a scoping attribute based on the passed token */
function scopeAttribute({ token }: PluginConfig, { host } = { host: false }) {
    let value = token;

    if (host) {
        value += '-host';
    }

    return attribute({
        attribute: value,
        value: undefined,
        raws: {},
    });
}

/**
 * Duplicate all the custom element tag to it's "is attribute" form
 *   x-foo -> x-foo, [is="x-foo"]
 */
function customElementSelector(selectors: Root) {
    // List of selectors waiting to be treated. Need to keep track of a list of pending
    // selectors to process to avoid processing twice the same custom element selector.
    const pending: Selector[] = [];

    // Find all the custom element selector and prefix them to be retrieved later
    selectors.each((selector: Selector) => {
        selector.each(node => {
            if (isCustomElement(node)) {
                node.value = CUSTOM_ELEMENT_SELECTOR_PREFIX + node.value;
                pending.push(selector);
            }
        });
    });

    while (pending.length > 0) {
        const selector = pending.pop()!;

        // Find first custom element tag in the selector
        const customElement = findNode(
            selector,
            node =>
                isTag(node) &&
                node.value.startsWith(CUSTOM_ELEMENT_SELECTOR_PREFIX),
        ) as Selector | undefined;

        if (customElement) {
            // Reassign original value to the selector by removing the prefix
            const name = customElement.value.slice(
                CUSTOM_ELEMENT_SELECTOR_PREFIX.length,
            );
            customElement.value = name;

            const clonedSelector = selector.clone({}) as Selector;
            selectors.append(clonedSelector);

            // Locate the node in the cloned selector and replace it
            const index = selector.index(customElement);
            replaceNodeWith(
                clonedSelector.at(index),
                attribute({
                    attribute: `is="${name}"`,
                    value: undefined,
                    raws: {},
                }),
            );

            // Add both original and transformed selectors to the pending queue for further processing.
            // Each of those selector can still contain other custom element nodes to process.
            pending.push(clonedSelector, selector);
        }
    }
}

/**
 * Add scoping attributes to all the matching selectors:
 *   h1 -> h1[x-foo_tmpl]
 *   p a -> p[x-foo_tmpl] a[x-foo_tmpl]
 */
function scopeSelector(selector: Selector, config: PluginConfig) {
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
        // Compound selectors containing :host have a special treatment and should not be scoped like the rest of the
        // complex selectors.
        const shouldScopeCompoundSelector = compoundSelector.every(node => !isHostPseudoClass(node));

        if (shouldScopeCompoundSelector) {
            let nodeToScope: Node | undefined;

            // In each compound selector we need to locate the last selector to scope.
            for (const node of compoundSelector) {
                if (!isPseudoElement(node)) {
                    nodeToScope = node;
                }
            }

            const scopeAttributeNode = scopeAttribute(config);
            if (nodeToScope) {
                // Add the scoping attribute right after the node scope
                selector.insertAfter(nodeToScope, scopeAttributeNode);
            } else {
                // Add the scoping token in the first position of the compound selector as a fallback
                // when there is no node to scope. For example: ::after {}
                selector.insertBefore(compoundSelector[0], scopeAttributeNode);
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
function transformHost(selector: Selector, config: PluginConfig) {
    // Locate the first :host pseudo-class
    const hostNode = findNode(selector, isHostPseudoClass) as
        | Pseudo
        | undefined;

    if (hostNode) {
        // Store the original location of the :host in the selector
        const hostIndex = selector.index(hostNode);

        // Swap the :host pseudo-class with the host scoping token
        const hostScopeAttr = scopeAttribute(config, { host: true });
        hostNode.replaceWith(hostScopeAttr);

        // Generate a unique contextualized version of the selector for each selector pass as argument
        // to the :host
        const contextualSelectors = hostNode.nodes.map(
            (contextSelectors: Selector) => {
                const clonedSelector = selector.clone({}) as Selector;
                const clonedHostNode = clonedSelector.at(hostIndex) as Tag;

                // Add to the compound selector previously containing the :host pseudo class
                // the contextual selectors.
                contextSelectors.each(node => {
                    trimNodeWhitespaces(node);
                    clonedSelector.insertAfter(clonedHostNode, node);
                });

                return clonedSelector;
            },
        );

        // Replace the current selector with the different variants
        replaceNodeWith(selector, ...contextualSelectors);
    }
}
export default function transformSelector(
    root: Root,
    pluginConfig: PluginConfig,
    transformConfig: SelectorScopingConfig,
) {
    validateSelectors(root);

    root.each((selector: Selector) => {
        scopeSelector(selector, pluginConfig);
    });

    if (transformConfig.transformHost) {
        root.each((selector: Selector) => {
            transformHost(selector, pluginConfig);
        });
    }

    customElementSelector(root);
}
