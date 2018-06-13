export function templateQuerySelector(element, selector) {
    return Element.prototype.querySelector.call(element, selector);
}

export function templateQuerySelectorAll(element, selector) {
    return Array.from(
        Element.prototype.querySelectorAll.call(element, selector)
    );
}
