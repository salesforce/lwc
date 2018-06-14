/**
 * Returns the shadowRoot property of a given Lightning web component.
 *
 * Use this utility instead of directly accessing the the element's ShadowRoot
 * to future-proof your test logic as LWC's Shadow DOM API implementation
 * evolves over time.
 *
 * @param {LWCElement} element The Lightning web component element to retrieve
 * the shadowRoot property off of
 * @returns {ShadowRoot} The shadowRoot property of the given element
 */
export function getShadowRoot(element) {
    if (!element || !element.$$ShadowRoot$$) {
        throw new Error(`Attempting to retrieve the ShadowRoot of ${element} but no shadowRoot property found`);
    }
    return element.$$ShadowRoot$$;
}
