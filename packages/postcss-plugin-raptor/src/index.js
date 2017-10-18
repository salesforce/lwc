const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

const {
    isTag,
    isPseudo,
    isCombinator,
    findNode,
    replaceNodeWith,
    trimNodeWhitespaces
} = require('./selector-utils');

const PLUGIN_NAME = 'postcss-plugin-raptor';

const DEPRECATED_SELECTORS = ['/deep/', '::shadow', '>>>'];

const HOST_SELECTOR_PLACEHOLDER = '$HOST$';

function hostPlaceholder() {
    return selectorParser.tag({ value: HOST_SELECTOR_PLACEHOLDER });
}

function isHostPlaceholder(node) {
    return isTag(node) && node.value === HOST_SELECTOR_PLACEHOLDER;
}

module.exports = postcss.plugin(PLUGIN_NAME, (options = {}) => {
    const { tagName, token } = options;

    if (tagName == undefined || typeof tagName !== 'string') {
        throw new TypeError(`tagName option must be a string but instead received ${typeof tagName}`);
    } else if (token == undefined || typeof token !== 'string') {
        throw new TypeError(`token option must be a string but instead received ${typeof token}`);
    }

    /** Generate a scoping attribute based on the passed token */
    const scopeAttribute = () =>
        selectorParser.attribute({
            attribute: token
        });

    /** Generate a host selector by tag name */
    const hostByTag = () => selectorParser.tag({ value: tagName });

    /** Generate a host selector via the "is" attribute: [is="x-foo"] */
    const hostByIsAttribute = () =>
        selectorParser.attribute({
            value: `is="${tagName}"`
        });

    /** Throw error on deprecated attributes */
    const errorOnDeprecatedSelectors = selector => {
        selector.walk(node => {
            const { value } = node;

            if (DEPRECATED_SELECTORS.includes(value)) {
                throw new Error(
                    `Invalid usage of deprecated ${value} selector`
                );
            }

            if (value === '::slotted') {
                throw new Error(
                    `::slotted pseudo-element selector is not supported`
                );
            }
        });
    };

    /**
     * Add scoping attributes to all the matching selectors:
     *   h1 -> h1[x-foo_tmpl]
     *   p a -> p[x-foo_tmpl] a[x-foo_tmpl]
     *
     * The scoping attribute should only get applied to the last selector of the
     * chain: h1.active -> h1.active[x-foo_tmpl]. We need to keep track of the next selector
     * candidate and add the scoping attribute before starting a new selector chain.
     */
    const scopeSelector = selector => {
        let candidate = undefined;

        selector.each(node => {
            const isScopableSelector = !isPseudo(node) && !isCombinator(node);
            const isSelectorChainEnd =
                isCombinator(node) || node === selector.last;

            if (isScopableSelector) {
                candidate = node;
            }

            if (candidate != undefined && isSelectorChainEnd) {
                selector.insertAfter(candidate, scopeAttribute());
                candidate = undefined;
            }
        });
    };

    /**
     * Mark the :host selector with a placeholder. If the selector has a list of
     * contextual selector it will generate a rule for each of them.
     *   :host -> $HOST$
     *   :host(.foo, .bar) -> $HOST$.foo, $HOST$.bar
     */
    const transfromHost = selector => {
        const hostNode = findNode(
            selector,
            node => isPseudo(node) && node.value === ':host'
        );

        if (hostNode) {
            hostNode.replaceWith(hostPlaceholder());

            const contextualSelectors = hostNode.nodes.map(contextSelectors => {
                const clone = selector.clone();
                const placeholder = findNode(clone, isHostPlaceholder);

                contextSelectors.each(node => {
                    trimNodeWhitespaces(node);
                    clone.insertAfter(placeholder, node);
                });

                return clone;
            });

            replaceNodeWith(selector, ...contextualSelectors);
        }
    };

    /**
     * Mark tranform :host-context by prepending the selector with the contextual selectors.
     *   :host-context(.dark) -> .dark x-foo, .dark [is="x-foo"]
     *
     * If the selector already contains :host, the selector should not be scoped twice.
     */
    const transformHostContext = selector => {
        const hostContextNode = findNode(
            selector,
            node => isPseudo(node) && node.value === ':host-context'
        );

        const hostNode = findNode(selector, isHostPlaceholder);

        if (hostContextNode) {
            hostContextNode.remove();

            const contextualSelectors = hostContextNode.nodes.map(
                contextSelectors => {
                    const clone = selector.clone();

                    if (!hostNode) {
                        clone.prepend(hostPlaceholder());
                    }

                    clone.prepend(selectorParser.combinator({ value: ' ' }));

                    contextSelectors.each(node => {
                        trimNodeWhitespaces(node);
                        clone.prepend(node);
                    });

                    return clone;
                }
            );

            replaceNodeWith(selector, ...contextualSelectors);
        }
    };

    /**
     * Replace the $HOST$ selectors with the actual scoped selectors.
     *   $HOST$ -> x-foo[x-foo_tmpl], [is="x-foo"][x-foo_tmpl]
     */
    const replaceHostPlaceholder = selector => {
        let hostPlaceholder = findNode(selector, isHostPlaceholder);

        if (hostPlaceholder) {
            const hostActualSelectors = [
                hostByTag(),
                hostByIsAttribute()
            ].map(actualSelector => {
                const clone = selector.clone();

                const placeholder = findNode(clone, isHostPlaceholder);
                placeholder.replaceWith(actualSelector);
                clone.insertAfter(actualSelector, scopeAttribute());

                return clone;
            });

            replaceNodeWith(selector, ...hostActualSelectors);
        }
    };

    const selectorTransform = selectorParser(selectors => {
        selectors.each(errorOnDeprecatedSelectors);

        selectors.each(scopeSelector);
        selectors.each(transfromHost);
        selectors.each(transformHostContext);

        selectors.each(replaceHostPlaceholder);
    });

    return root => {
        root.walkRules(rule => {
            try {
                rule.selector = selectorTransform.processSync(rule.selector);
            } catch (error) {
                throw rule.error(error.message, { name: PLUGIN_NAME });
            }
        });
    };
});
