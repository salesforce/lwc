/* tslint:disable:no-duplicate-imports */

import * as parser from 'postcss-selector-parser';
import {
    attribute,
    tag,
    combinator,
    isTag,
    isPseudo,
    isPseudoElement,
    isCombinator,
    Processor,
    Selector,
    Root,
    Node,
    Pseudo,
    Tag,
    PostCSSRuleNode,
} from 'postcss-selector-parser';

import validateSelectors from './selector-validate';
import { PluginConfig } from './config';
import {
    isCustomElement,
    findNode,
    replaceNodeWith,
    trimNodeWhitespaces,
    isHostContextPseudoClass,
    isHostPseudoClass,
} from './selector-utils';

const HOST_SELECTOR_PLACEHOLDER = '$HOST$';
const CUSTOM_ELEMENT_SELECTOR_PREFIX = '$CUSTOM$';

function hostPlaceholder() {
    return tag({ value: HOST_SELECTOR_PLACEHOLDER });
}

function isHostPlaceholder(node: Node) {
    return isTag(node) && node.value === HOST_SELECTOR_PLACEHOLDER;
}

/** Generate a scoping attribute based on the passed token */
function scopeAttribute({ token }: PluginConfig) {
    return attribute({
        attribute: token,
        value: undefined,
        raws: {},
    });
}

/** Generate a host selector by tag name */
function hostByTag({ tagName }: PluginConfig) {
    return tag({ value: tagName });
}

/** Generate a host selector via the "is" attribute: [is="x-foo"] */
function hostByIsAttribute({ tagName }: PluginConfig) {
    return attribute({
        attribute: `is="${tagName}"`,
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
 *
 * The scoping attribute should only get applied to the last selector of the
 * chain: h1.active -> h1.active[x-foo_tmpl]. We need to keep track of the next selector
 * candidate and add the scoping attribute before starting a new selector chain.
 */
function scopeSelector(selector: Selector, config: PluginConfig) {
    let candidate: Node | undefined;

    selector.each(node => {
        const isScopableSelector =
            !isPseudoElement(node) &&
            !isCombinator(node) &&
            !isHostPseudoClass(node) &&
            !isHostContextPseudoClass(node);

        const isSelectorChainEnd = isCombinator(node) || node === selector.last;

        if (isScopableSelector) {
            candidate = node;
        }

        if (candidate && isSelectorChainEnd) {
            selector.insertAfter(candidate, scopeAttribute(config));
            candidate = undefined;
        }
    });
}

/**
 * Mark the :host selector with a placeholder. If the selector has a list of
 * contextual selector it will generate a rule for each of them.
 *   :host -> $HOST$
 *   :host(.foo, .bar) -> $HOST$.foo, $HOST$.bar
 */
function transformHost(selector: Selector) {
    const hostNode = findNode(selector, isHostPseudoClass) as
        | Pseudo
        | undefined;

    if (hostNode) {
        const placeholder = hostPlaceholder();
        hostNode.replaceWith(placeholder);

        const contextualSelectors = hostNode.nodes.map(
            (contextSelectors: Selector) => {
                const clone = selector.clone({}) as Selector;
                const clonePlaceholder = findNode(
                    clone,
                    isHostPlaceholder,
                )! as Tag;

                contextSelectors.each(node => {
                    trimNodeWhitespaces(node);
                    clone.insertAfter(clonePlaceholder, node);
                });

                return clone;
            },
        );

        replaceNodeWith(selector, ...contextualSelectors);
    }
}

/**
 * Mark transform :host-context by prepending the selector with the contextual selectors.
 *   :host-context(.dark) -> .dark x-foo, .dark [is="x-foo"]
 *
 * If the selector already contains :host, the selector should not be scoped twice.
 */
function transformHostContext(selector: Selector) {
    const hostContextNode = findNode(selector, isHostContextPseudoClass) as
        | Pseudo
        | undefined;

    const hostNode = findNode(selector, isHostPlaceholder);

    if (hostContextNode) {
        hostContextNode.remove();

        const contextualSelectors = hostContextNode.nodes.map(
            (contextSelectors: Selector) => {
                const clone = selector.clone({}) as Selector;

                if (!hostNode) {
                    clone.insertBefore(clone.first, hostPlaceholder());
                }

                clone.insertBefore(clone.first, combinator({ value: ' ' }));

                contextSelectors.each(node => {
                    trimNodeWhitespaces(node);
                    clone.insertBefore(clone.first, node);
                });

                return clone;
            },
        );

        replaceNodeWith(selector, ...contextualSelectors);
    }
}

/**
 * Replace the $HOST$ selectors with the actual scoped selectors.
 *   $HOST$ -> x-foo[x-foo_tmpl], [is="x-foo"][x-foo_tmpl]
 */
function replaceHostPlaceholder(selector: Selector, config: PluginConfig) {
    const hasHostPlaceholder = findNode(selector, isHostPlaceholder);

    if (hasHostPlaceholder) {
        const hostActualSelectors = [
            hostByTag(config),
            hostByIsAttribute(config),
        ].map(actualSelector => {
            const clone = selector.clone({}) as Selector;

            const placeholder = findNode(clone, isHostPlaceholder)!;
            placeholder.replaceWith(actualSelector);
            clone.insertAfter(actualSelector, scopeAttribute(config));

            return clone;
        });

        replaceNodeWith(selector, ...hostActualSelectors);
    }
}

/** Returns selector processor based on the passed config */
function selectorProcessor(config: PluginConfig) {
    return parser(root => {
        validateSelectors(root);

        root.each((selector: Selector) => scopeSelector(selector, config));

        root.each(transformHost);
        root.each(transformHostContext);

        customElementSelector(root);

        root.each((selector: Selector) =>
            replaceHostPlaceholder(selector, config),
        );
    }) as Processor;
}

export default function transformSelector(
    selector: string | PostCSSRuleNode,
    config: PluginConfig,
): string {
    const processor = selectorProcessor(config);
    return processor.processSync(selector);
}
