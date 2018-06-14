/**
 * Returns the first element that is a descendant of the LWC element template
 * on which it is invoked that matches the specified group of selectors.
 *
 * Use this utility over `Element.querySelector` to maintain consistent
 * behavior through LWC's evolving Shadow DOM API implementation.
 *
 * @param {Element} element The LWC element to query.
 * @param {String} selectors A group of selectors to match against. Matches the
 * native `Element.querySelector(selectors)` parameter.
 * @returns {Element} The first decendent that matches the given selectors.
 */
export function templateQuerySelector(element, selectors) {
    return Element.prototype.querySelector.call(element, selectors);
}

/**
 * Returns a static NodeList representing the list of elements that are
 * descendants of the LWC element template on which it is invoked that matches
 * the specified group of selectors.
 *
 * Use this utility over `Element.querySelectorAll` to maintain consistent
 * behavior through LWC's evolving Shadow DOM API implementation.
 *
 * @param {Element} element The LWC element to query.
 * @param {String} selectors A group of selectors to match against. Matches the
 * native `Element.querySelectorAll(selectors)` parameter.
 * @returns {NodeList} The list of elements that match the given selectors.
 */
export function templateQuerySelectorAll(element, selectors) {
    return Array.from(
        Element.prototype.querySelectorAll.call(element, selectors)
    );
}
