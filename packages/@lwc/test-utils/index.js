/**
 * Returns the shadowRoot property of a given Lightning web component.
 *
 * Use this utility instead of directly accessing the the element's ShadowRoot
 * to future-proof your test logic as LWC's Shadow DOM API implementation
 * evolves over time.
 *
 * @param {LWCElement} element The Lightning web component element to retrieve
 * the shadowRoot property off of
 * @returns {ShadowRoot} The shadow root of the given element
 */
module.exports.getShadowRoot = function(element) {
    if (!element || !element.$$ShadowRoot$$) {
        const tagName = element && element.tagName && element.tagName.toLowerCase();
        throw new Error(`Attempting to retrieve the shadow root of '${tagName || element}' but no shadowRoot property found`);
    }
    return element.$$ShadowRoot$$;
}
