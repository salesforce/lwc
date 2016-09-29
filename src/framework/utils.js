// @flow

const baseMarker = document.createComment('');
const elementCache = {};

export function createEmptyElement(tagName: string): Node {
    if (!tagName) {
        return baseMarker.cloneNode();
    }
    let baseElement = elementCache[tagName] ||
        (elementCache[tagName] = document.createElement(tagName));
    return baseElement.cloneNode();
}
